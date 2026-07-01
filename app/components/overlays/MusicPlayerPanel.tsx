"use client";

import { motion, AnimatePresence } from "framer-motion";

type ActivePlayer = {
  type: string;
  url: string;
  embedUrl: string | null;
};

type Props = {
  activePlayer: ActivePlayer | null;
  onClose: () => void;
};

function PlayerLabel({ type }: { type: string }) {
  if (type === "youtube") return <>YouTube Плеер</>;
  if (type === "spotify") return <>Spotify Плеер</>;
  return <>Яндекс.Музыка Плеер</>;
}

function PlayerEmbed({ activePlayer }: { activePlayer: ActivePlayer }) {
  if (!activePlayer.embedUrl) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-white/70 mb-3">Превью недоступно</p>
        <a
          href={activePlayer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-full transition inline-block"
        >
          Открыть на сайте
        </a>
      </div>
    );
  }

  if (activePlayer.type === "youtube") {
    return (
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
    );
  }

  if (activePlayer.type === "spotify") {
    return (
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
    );
  }

  return (
    <div className="w-full h-[120px]">
      <iframe
        style={{ border: "none", width: "100%", height: "100%" }}
        src={activePlayer.embedUrl}
      />
    </div>
  );
}

export default function MusicPlayerPanel({ activePlayer, onClose }: Props) {
  return (
    <AnimatePresence>
      {activePlayer && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-[320px] h-auto rounded-3xl bg-zinc-900/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              <PlayerLabel type={activePlayer.type} />
            </span>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white text-lg"
            >
              ×
            </button>
          </div>

          <div className="w-full rounded-2xl overflow-hidden bg-zinc-950/50 flex items-center justify-center">
            <PlayerEmbed activePlayer={activePlayer} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
