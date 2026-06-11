import React from "react";

type Props = {
  onGoogleLogin: () => void;
};

export default function WelcomeScreen({ onGoogleLogin }: Props) {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white grid grid-cols-1 md:grid-cols-2">
      {/* Левая/Верхняя часть: Брендинг и крупный логотип */}
      <div className="flex flex-col justify-center items-center p-8 bg-zinc-900/40 backdrop-blur-sm border-r border-white/5 relative overflow-hidden">
        {/* Фоновое легкое свечение */}
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="max-w-xs w-full flex flex-col items-center md:items-start text-center md:text-left z-10">
          {/* Увеличенный логотип (занимает заметное место, но не весь экран) */}
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
            <img
              src="/logo.png"
              alt="App Logo"
              className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-2xl shadow-black/80"
              // style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Музыкальные Мемори
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Сохраняйте любимые треки, делитесь воспоминаниями и открывайте
            музыку на карте.
          </p>
        </div>
      </div>

      {/* Правая/Нижняя часть: Вход в систему */}
      <div className="flex flex-col justify-center items-center p-8 relative">
        <div className="w-full max-w-xs flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-6">Добро пожаловать</h2>

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

          <p className="mt-6 text-xs text-zinc-600 text-center max-w-xs">
            Продолжая использовать приложение, вы соглашаетесь с условиями
            использования и политикой конфиденциальности.
          </p>
        </div>
      </div>
    </div>
  );
}
