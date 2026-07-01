"use client";

import { useState } from "react";
import { useComments } from "@/app/hooks/useComments";

type Props = {
  pinId: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
};

export default function PinComments({
  pinId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: Props) {
  const { comments, isSubmitting, addComment, deleteComment } =
    useComments(pinId);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim() || !currentUserId) return;

    try {
      await addComment(commentText.trim(), {
        id: currentUserId,
        name: currentUserName || "Гость",
        avatar: currentUserAvatar || "",
      });
      setCommentText("");
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
    commentUserId: string,
  ) => {
    if (commentUserId !== currentUserId) {
      alert("Вы можете удалять только свои комментарии");
      return;
    }
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Комментарии ({comments.length})
      </h3>

      <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/5 rounded-xl p-2.5 flex gap-2.5 text-xs group"
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
                <span className="font-semibold block text-white/70">
                  {comment.userName || "Гость"}
                </span>
                <p className="text-white/90 break-words mt-0.5">
                  {comment.text}
                </p>
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
  );
}
