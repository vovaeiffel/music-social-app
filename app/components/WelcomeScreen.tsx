import React from "react";

type Props = {
  onGoogleLogin: () => void;
};

export default function WelcomeScreen({ onGoogleLogin }: Props) {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* 1. Фоновый контейнер (картинка с фиолетовым свечением) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* ЯРКО-ФИОЛЕТОВОЕ СВЕЧЕНИЕ: заменено на purple-500/30 с большим размытием blur-[100px] */}
        <div className="absolute w-[600px] h-[600px] bg-purple-500/30 blur-[10px] rounded-full" />

        <img
          src="/logo.png"
          alt="Background Logo"
          // drop-shadow создает свечение, повторяющее форму картинки (закругления 3xl)
          // 0 0 60px — радиус размытия, цвет rgba(168, 85, 247, 0.6) — фиолетовый с прозрачностью
          className="w-[768px] h-[768px] object-cover opacity-100 rounded-3xl drop-shadow-[0_0_70px_rgba(168,85,247,0.6)]"
        />
      </div>

      {/* 2. Контейнер контента (опущен вниз, текст темно-серый) */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center p-8 mt-[480px]">
        <p className="text-sm text-zinc-500 mb-8 max-w-xs">
          Сохраняйте любимые треки, делитесь воспоминаниями и открывайте музыку
          на карте.
        </p>

        {/* Кнопка входа через Google */}
        <button
          onClick={onGoogleLogin}
          className="
            w-full h-12 rounded-2xl bg-white hover:bg-zinc-200 
            text-zinc-900 font-medium text-sm flex items-center 
            justify-center gap-3 transition-all duration-300 
            hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] 
            active:scale-95 border border-white/20 cursor-pointer shadow-lg
          "
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.84-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l2.84 2.84C5.89 7.31 8.32 5.38 12 5.38z"
            />
          </svg>
          Войти через Google
        </button>
      </div>
    </div>
  );
}
