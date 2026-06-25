"use client";

import { usePinStore } from "@/app/store/pinStore";
import { memo, useState, useEffect } from "react";
import { FaYoutube, FaSpotify } from "react-icons/fa";
import type { PinType } from "@/app/types/pin";
import { useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
// Импортируем функции для работы с Firestore и базу данных (проверьте путь к вашему конфигу firebase)
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Вспомогательная функция для парсинга ссылок в iframe-формат
function getEmbedUrl(type: string, url: string) {
  if (type === "youtube") {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (type === "spotify") {
    const regExp = /track\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    const trackId = match ? match[1] : null;
    return trackId
      ? `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`
      : null;
  }
  // Добавляем парсинг для Яндекс.Музыки
  if (type === "yandex") {
    // Ищет паттерн /album/АЛЬБОМ/track/ТРЕК
    const regExp = /album\/(\d+)\/track\/(\d+)/;
    const match = url.match(regExp);
    if (match && match[1] && match[2]) {
      const albumId = match[1];
      const trackId = match[2];
      return `https://music.yandex.ru/iframe/#track/${trackId}/${albumId}/`;
    }
  }
  return null;
}

type Props = {
  onClose: () => void;
  toggleLike: (pinId: string, liked: boolean) => void;
  currentUserId?: string;
  onEditPin: (pin: PinType) => void;
  onDeletePin: (pinId: string) => void;
  onOpenUserProfile: (userId: string) => void;
  // Добавляем пропсы профиля текущего юзера (имя и аватар), чтобы знать, кто оставляет коммент
  currentUserName?: string;
  currentUserAvatar?: string;
};

function SelectedPinOverlay({
  onClose,
  toggleLike,
  currentUserId,
  onEditPin,
  onDeletePin,
  onOpenUserProfile,
  currentUserName,
  currentUserAvatar,
}: Props) {
  const selectedPin = usePinStore((state) => state.selectedPin);

  const pin = selectedPin;
  const map = useMap();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1);

  // Состояние для активного плеера
  const [activePlayer, setActivePlayer] = useState<{
    type: string;
    url: string;
    embedUrl: string | null;
  } | null>(null);

  // Состояния для комментариев
  const [comments, setComments] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pin) return;

    function updatePosition() {
      if (!pin) return;
      const point = map.latLngToContainerPoint([pin.latitude, pin.longitude]);
      setPosition({ x: point.x, y: point.y });
      const zoom = map.getZoom();
      const scale = 0.25 + zoom * 0.08;
      setZoomScale(scale);
    }

    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [pin, map]);

  // Подгрузка комментариев в реальном времени для выбранного пина
  useEffect(() => {
    if (!pin?.id) return;

    const q = query(
      collection(db, "comments"),
      where("pinId", "==", pin.id),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [pin?.id]);

  // Функция отправки комментария
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Гарантированно останавливаем всплытие

    console.log("Кнопка нажата, текст:", commentText); // <--- ЭТОТ ЛОГ ПОКАЖЕТ, РАБОТАЕТ ЛИ ФОРМА

    if (!commentText.trim()) {
      console.warn("Текст пуст");
      return;
    }
    if (!pin) {
      console.warn("Нет пина");
      return;
    }
    if (!currentUserId) {
      console.warn("Нет пользователя");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        pinId: pin.id,
        userId: currentUserId,
        userName: currentUserName || "Гость",
        userAvatar: currentUserAvatar || "",
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      console.log("Комментарий успешно отправлен");
      setCommentText("");
    } catch (error) {
      console.error("Ошибка Firebase при отправке:", error); // Если ошибка здесь, значит, проблема в правилах доступа
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pin) return null;

  const handleDeleteComment = async (
    commentId: string,
    commentUserId: string,
  ) => {
    if (commentUserId !== currentUserId) {
      alert("Вы можете удалять только свои комментарии");
      return;
    }

    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleMusicLinkClick = (type: string, url: string) => {
    const embedUrl = getEmbedUrl(type, url);

    if (activePlayer && activePlayer.url === url) {
      setActivePlayer(null);
    } else {
      setActivePlayer({ type, url, embedUrl });
    }
  };

  return (
    <motion.div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: zoomScale * 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="absolute z-[9999]"
      style={{
        left: position.x - 360,
        top: position.y - 80,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Основная карточка пина */}
        <div
          ref={(el) => {
            if (!el) return;
            L.DomEvent.disableClickPropagation(el);
            L.DomEvent.disableScrollPropagation(el);
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="
            w-[320px] max-w-[85vw] rounded-3xl
            bg-zinc-900/85 supports-[backdrop-filter]:bg-zinc-900/70
            backdrop-blur-3xl border border-white/10
            shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-4 text-white pointer-events-auto
            max-h-[80vh] overflow-y-auto flex flex-col
          "
        >
          <div className="flex justify-between items-start mb-3">
            <button
              onClick={() => onOpenUserProfile(pin.user_id)}
              className="flex items-center gap-2 mb-3 hover:opacity-80 transition"
            >
              {pin.user_avatar && (
                <img
                  src={pin.user_avatar}
                  alt="avatar"
                  className="w-7 h-7 rounded-full"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {pin.user_name || "Unknown"}
                </p>
                <p className="text-[11px] text-white/40">music memory</p>
              </div>
            </button>

            <div>
              <h2 className="text-base font-semibold">{pin.song_title}</h2>
              <p className="text-zinc-400">{pin.artist_name}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white/50 text-sm hover:text-white"
            >
              ×
            </button>
          </div>

          <p className="text-[13px] leading-relaxed text-white/80 mb-4">
            {pin.story}
          </p>

          {pin.image_url && (
            <div className="mb-4 w-full h-48 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={pin.image_url}
                alt="Pin photo"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {pin.music_links && pin.music_links.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-2 mt-4 flex-wrap">
                {pin.music_links.map((link, index) => {
                  let icon = null;
                  let bg = "";
                  let glowColor = "";
                  let hoverGlow = "";

                  if (link.type === "youtube") {
                    icon = <FaYoutube size={20} />;
                    bg = "bg-red-500/90 hover:bg-red-500";
                    hoverGlow = "hover:shadow-red-500/70";
                    glowColor = "rgba(239,68,68,0.9)";
                  }

                  if (link.type === "spotify") {
                    icon = <FaSpotify size={20} />;
                    bg = "bg-green-500/90 hover:bg-green-500";
                    hoverGlow = "hover:shadow-green-500/70";
                    glowColor = "rgba(34,197,94,0.9)";
                  }

                  if (link.type === "yandex") {
                    icon = (
                      <img
                        src="/icons/yandex_music.png"
                        alt="Yandex Music"
                        className="w-11 h-11 rounded-full"
                      />
                    );
                    hoverGlow = "hover:shadow-orange-400/70";
                    glowColor = "rgba(251,146,60,0.9)";
                  }

                  const isActive = activePlayer?.url === link.url;

                  return (
                    <button
                      key={index}
                      onClick={() => handleMusicLinkClick(link.type, link.url)}
                      style={{
                        boxShadow: `0 4px 18px rgba(0,0,0,0.35)`,
                        borderColor: isActive
                          ? glowColor
                          : "rgba(255,255,255,0.1)",
                      }}
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center
                        text-lg border backdrop-blur-xl shadow-lg shadow-black/30
                        transition-all duration-300 hover:scale-110 hover:-translate-y-1
                        hover:shadow-2xl ${hoverGlow} active:scale-95 ${bg}
                      `}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(pin.id, pin.liked_by_user || false);
              }}
              className="text-sm hover:scale-105 transition"
            >
              {pin.liked_by_user ? "❤️" : "🤍"} {pin.likes_count || 0}
            </button>

            {currentUserId === pin.user_id && (
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPin(pin);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePin(pin.id);
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* --- БЛОК КОММЕНТАРИЕВ --- */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Комментарии ({comments.length})
            </h3>

            {/* Список комментариев с прокруткой, если их много */}
            <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/5 rounded-xl p-2.5 flex gap-2.5 text-xs group" // Добавили класс group
                  >
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt=""
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        {comment.userName?.[0]?.toUpperCase() || "G"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 relative">
                      {" "}
                      {/* Добавили relative */}
                      <span className="font-semibold block text-white/70">
                        {comment.userName || "Гость"}
                      </span>
                      <p className="text-white/90 break-words mt-0.5">
                        {comment.text}
                      </p>
                      {/* Кнопка удаления */}
                      {currentUserId === comment.userId && (
                        <button
                          onClick={() =>
                            handleDeleteComment(comment.id, comment.userId)
                          }
                          className="absolute right-0 top-0 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-white/30 italic py-1">
                  Пока комментариев нет. Будьте первым!
                </p>
              )}
            </div>

            {/* Форма ввода нового комментария */}
            {currentUserId ? (
              <form onSubmit={handleAddComment} className="relative mt-1">
                <input
                  type="text"
                  placeholder="Оставить комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitting}
                  className="
                    w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-3 pr-10 
                    text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20
                    disabled:opacity-50
                  "
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-xl
                    bg-white/10 hover:bg-white/20 flex items-center justify-center 
                    transition disabled:opacity-30 text-[10px]
                  "
                >
                  ➤
                </button>
              </form>
            ) : (
              <p className="text-[10px] text-white/40 text-center py-1">
                Авторизуйтесь, чтобы оставлять комментарии
              </p>
            )}
          </div>
          {/* --- КОНЕЦ БЛОКА КОММЕНТАРИЕВ --- */}
        </div>

        {/* Боковой блок плеера */}
        <AnimatePresence>
          {activePlayer && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="
                w-[320px] h-auto rounded-3xl
                bg-zinc-900/95 backdrop-blur-3xl border border-white/10
                shadow-[0_20px_80px_rgba(0,0,0,0.5)] p-4 flex flex-col
              "
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {activePlayer.type === "youtube"
                    ? "YouTube"
                    : activePlayer.type === "spotify"
                      ? "Spotify"
                      : "Яндекс.Музыка"}{" "}
                  Плеер
                </span>
                <button
                  onClick={() => setActivePlayer(null)}
                  className="text-white/50 hover:text-white text-lg"
                >
                  ×
                </button>
              </div>

              <div className="w-full rounded-2xl overflow-hidden bg-zinc-950/50 flex items-center justify-center">
                {activePlayer.embedUrl ? (
                  activePlayer.type === "youtube" ? (
                    <div className="w-full aspect-video">
                      <iframe
                        style={{ borderRadius: "12px" }}
                        src={activePlayer.embedUrl}
                        width="100%"
                        height="100%"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  ) : activePlayer.type === "spotify" ? (
                    <div className="w-full h-[152px]">
                      <iframe
                        style={{ borderRadius: "12px" }}
                        src={activePlayer.embedUrl}
                        width="100%"
                        height="100%"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    // Отображение плеера для Яндекс.Музыки
                    <div className="w-full h-[120px]">
                      <iframe
                        frameBorder="0"
                        style={{
                          border: "none",
                          width: "100%",
                          height: "100%",
                        }}
                        src={activePlayer.embedUrl}
                      />
                    </div>
                  )
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-white/70 mb-3">
                      Превью недоступно
                    </p>
                    <a
                      href={activePlayer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-full transition inline-block"
                    >
                      Открыть на сайте
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default memo(SelectedPinOverlay);
