import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
  onRouteFound: (summary: L.Routing.Summary) => void;
}

const RoutingMachine = ({ start, end, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false, // Nonaktifkan update saat dragging untuk performa
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      show: false, // Sembunyikan panel instruksi default
      addWaypoints: false,
      fitSelectedRoutes: true,
      plan: new L.Routing.Plan(
        [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        {
          createMarker: () => false, // Sembunyikan marker dari routing machine
        }
      ),
    })
      .on("routesfound", (e) => {
        if (e.routes && e.routes.length > 0) {
          // Kirim ringkasan rute (jarak, waktu) ke komponen induk
          onRouteFound(e.routes[0].summary);
        }
      })
      .addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end, onRouteFound]);

  return null;
};

export default RoutingMachine;
