import L from "leaflet";

export const customIcon = new L.DivIcon({
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: #18181b;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 15px rgba(255,255,255,0.25);
      "
    >
      🎵
    </div>
  `,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export const activeIcon = L.divIcon({
  className: "custom-marker",

  html: `
    <div
      style="
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #ffffff;
        border: 4px solid #ef4444;
        box-shadow:
          0 0 0 6px rgba(239,68,68,0.25),
          0 0 24px rgba(239,68,68,0.6);
      "
    />
  `,

  iconSize: [22, 22],
  iconAnchor: [11, 11],
});
