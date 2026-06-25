"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";

export default function AppTips() {
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    {
      title: "Как создать пин",
      desc: "Двойной клик в любое место на карте. В открывшемся окне добавь трек, свою историю и фото до 5МБ.",
    },
    {
      title: "Музыкальные ссылки",
      desc: "Вставляй ссылки на YouTube, Spotify или Яндекс.Музыку. Мы сами определим платформу и добавим иконку.",
    },
    {
      title: "Конфиденциальность",
      desc: "Выбирай: 'Only Me' (приватно), 'Friends' (для тех, кто зашел в профиль) или 'Global' (на карте для всех).",
    },
    {
      title: "Карты: Глобальная vs Своя",
      desc: "Global Map — музыкальные метки всех пользователей. My Map — только твои личные воспоминания.",
    },
    {
      title: "Настройка пина",
      desc: "Для глобальных пинов можно выбрать цвет и иконку-категорию, чтобы передать настроение момента.",
    },
  ];

  return (
    <div className="absolute left-4 bottom-15 z-[1000] flex flex-col-reverse gap-3 w-64 pointer-events-auto">
      {/* Кнопка активации */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:scale-105 transition-all shadow-lg hover:shadow-indigo-500/25"
      >
        {isOpen ? <X size={20} /> : <Lightbulb size={20} />}
        <span>{isOpen ? "Закрыть" : "Подсказки"}</span>
      </button>

      {/* Список подсказок */}
      {isOpen && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl"
            >
              <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                {tip.title}
              </h3>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
