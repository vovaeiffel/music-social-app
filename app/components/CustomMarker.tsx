import L from "leaflet";

export function getPinIcon(type?: string) {
  switch (type) {
    case "concert":
      return concertIcon;

    case "roadtrip":
      return roadtripIcon;

    case "camping":
      return campingIcon;

    case "night":
      return nightIcon;

    case "summer":
      return summerIcon;

    case "person":
      return personIcon;

    case "music":
    default:
      return musicIcon;
  }
}

export function getActivePinIcon(type?: string) {
  switch (type) {
    case "concert":
      return activeConcertIcon;

    case "roadtrip":
      return activeRoadtripIcon;

    case "camping":
      return activeCampingIcon;

    case "night":
      return activeNightIcon;

    case "summer":
      return activeSummerIcon;

    case "person":
      return activePersonIcon;

    case "music":
    default:
      return activeMusicIcon;
  }
}

function createEmojiIcon(emoji: string, active = false) {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:${active ? 52 : 42}px;
          height:${active ? 52 : 42}px;

          border-radius:999px;

          background:${active ? "white" : "rgba(0,0,0,0.75)"};

          border:1px solid rgba(255,255,255,0.15);

          display:flex;
          align-items:center;
          justify-content:center;

          font-size:${active ? 26 : 22}px;

          box-shadow:
            0 10px 30px rgba(0,0,0,0.35);

          transition:all .2s ease;
        "
      >
        ${emoji}
      </div>
    `,
    iconSize: active ? [52, 52] : [42, 42],
    iconAnchor: active ? [26, 26] : [21, 21],
    popupAnchor: [0, -20],
  });
}

export const musicIcon = createEmojiIcon("🎵");
export const concertIcon = createEmojiIcon("🎤");
export const roadtripIcon = createEmojiIcon("🚗");
export const campingIcon = createEmojiIcon("⛺");
export const nightIcon = createEmojiIcon("🌙");
export const summerIcon = createEmojiIcon("☀️");
export const personIcon = createEmojiIcon("👤");

export const activeMusicIcon = createEmojiIcon("🎵", true);
export const activeConcertIcon = createEmojiIcon("🎤", true);
export const activeRoadtripIcon = createEmojiIcon("🚗", true);
export const activeCampingIcon = createEmojiIcon("⛺", true);
export const activeNightIcon = createEmojiIcon("🌙", true);
export const activeSummerIcon = createEmojiIcon("☀️", true);
export const activePersonIcon = createEmojiIcon("👤", true);
