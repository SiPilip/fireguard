import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
  onRouteFound: (summary: any) => void;
}

const RoutingMachine = ({ start, end, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      lineOptions: {
        styles: [{ color: "#FF5733", weight: 6, opacity: 0.9, className: 'routing-line' }],
        extendToWaypoints: false,
        missingRouteTolerance: 5,
      },
      show: false,
      addWaypoints: false,
      plan: new L.Routing.Plan([L.latLng(start[0], start[1]), L.latLng(end[0], end[1])], {
        createMarker: () => false,
      }),
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
