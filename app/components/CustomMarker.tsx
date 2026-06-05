import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentType } from "react"; // <-- ДОБАВИЛИ ИМПОРТ

import {
  Music,
  Mic,
  Car,
  Tent,
  Moon,
  Sun,
  User,
  Compass,
  LucideProps,
  Headphones,
  Guitar,
  Sparkles,
  Wine,
  Beer,
  Trophy,
  Plane,
  Heart,
  Flame,
  Dumbbell,
  // 3 НОВЫЕ ИКОНКИ:
  Clapperboard,
  Camera,
  Coffee,
} from "lucide-react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  music: Music,
  concert: Mic,
  roadtrip: Car,
  camping: Tent,
  night: Moon,
  summer: Sun,
  person: User,
  headphones: Headphones,
  guitar: Guitar,
  party: Sparkles,
  bar: Wine,
  pub: Beer,
  festival: Trophy,
  travel: Plane,
  love: Heart,
  chill: Flame,
  sport: Dumbbell,
  // Добавляем в маппинг карты:
  cinema: Clapperboard,
  photo: Camera,
  cafe: Coffee,
};
function createDynamicIcon(
  type = "music",
  active = false,
  visibility?: string,
  color?: string,
) {
  // Находим нужный компонент иконки
  const IconComponent = iconMap[type] || Compass;

  // Рендерим React-иконку в чистый SVG-код для Leaflet
  // Делаем размер иконки чуть меньше контейнера, чтобы она аккуратно сидела внутри
  const iconSizePx = active ? 24 : 20;
  const svgHtml = renderToStaticMarkup(
    <IconComponent
      size={iconSizePx}
      strokeWidth={2.5}
      color={active && !color ? "black" : "white"}
    />,
  );

  // Вычисляем фон
  let background = active ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.75)";
  if (!active) {
    if (visibility === "private") {
      background = "rgb(39, 39, 42)";
    } else if (color) {
      background = color;
    }
  } else {
    if (visibility === "private") {
      background = "rgb(63, 63, 70)";
    } else if (color) {
      background = color;
    }
  }

  const border = active
    ? "3px solid rgba(255, 255, 255, 1)"
    : "1px solid rgba(255, 255, 255, 0.2)";

  const shadow =
    active && color && visibility !== "private"
      ? `0 0 25px ${color}, 0 10px 30px rgba(0,0,0,0.5)`
      : "0 10px 30px rgba(0,0,0,0.35)";

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: ${active ? 52 : 42}px;
          height: ${active ? 52 : 42}px;
          border-radius: 999px;
          background: ${background};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${shadow};
          transition: all .2s ease;
        "
      >
        ${svgHtml}
      </div>
    `,
    iconSize: active ? [52, 52] : [42, 42],
    iconAnchor: active ? [26, 26] : [21, 21],
    popupAnchor: [0, -20],
  });
}

export function getPinIcon(type?: string, visibility?: string, color?: string) {
  return createDynamicIcon(type, false, visibility, color);
}

export function getActivePinIcon(
  type?: string,
  visibility?: string,
  color?: string,
) {
  return createDynamicIcon(type, true, visibility, color);
}
