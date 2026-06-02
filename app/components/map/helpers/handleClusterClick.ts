import L from "leaflet";

type ClusterClickEvent = {
  layer: L.MarkerCluster;
};

export function handleClusterClick(event: ClusterClickEvent) {
  const cluster = event.layer;

  const bounds = cluster.getBounds();

  const map = (cluster as unknown as { _map: L.Map })._map;

  if (!map) return;

  map.flyToBounds(bounds, {
    padding: [80, 80],
    duration: 0.8,
    easeLinearity: 0.25,
  });
}
