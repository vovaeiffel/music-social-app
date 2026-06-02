import L from "leaflet";

export function clusterIconCreateFunction(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();

  return L.divIcon({
    html: `
      <div
        style="
          width:52px;
          height:52px;
          border-radius:999px;

          background:rgba(0,0,0,0.72);
          backdrop-filter:blur(18px);

          border:1px solid rgba(255,255,255,0.12);

          display:flex;
          align-items:center;
          justify-content:center;

          color:white;
          font-weight:600;
          font-size:15px;

          box-shadow:
            0 0 30px rgba(255,255,255,0.08),
            0 10px 40px rgba(0,0,0,0.35);
        "
      >
        ${count}
      </div>
    `,
    className: "",
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

export const clusterOptions = {
  animate: true,

  animateAddingMarkers: true,

  zoomToBoundsOnClick: false,

  chunkedLoading: true,

  maxClusterRadius: 60,

  spiderfyDistanceMultiplier: 1.5,

  spiderfyOnMaxZoom: true,

  showCoverageOnHover: false,

  polygonOptions: {
    fillOpacity: 0,
    weight: 0,
  },

  iconCreateFunction: clusterIconCreateFunction,
};
