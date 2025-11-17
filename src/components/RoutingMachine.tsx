import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
  onRouteFound?: (summary: any) => void;
}

const RoutingMachine = ({ start, end, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let routingControl: L.Routing.Control | null = null;
    let polyline: L.Polyline | null = null;

    try {
      // Gunakan router OSRM dengan timeout handling
      routingControl = L.Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          timeout: 5000, // 5 second timeout
        }),
        lineOptions: {
          styles: [{ color: "#FF5733", weight: 6, opacity: 0.9, className: 'routing-line' }],
          extendToWaypoints: false,
          missingRouteTolerance: 10,
        },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        plan: new L.Routing.Plan([L.latLng(start[0], start[1]), L.latLng(end[0], end[1])], {
          createMarker: () => false,
        }),
      })
        .on("routesfound", (e) => {
          if (e.routes && e.routes.length > 0 && onRouteFound) {
            onRouteFound(e.routes[0].summary);
          }
        })
        .on("routingerror", (e) => {
          console.warn("Routing error, using straight line fallback", e);
          
          // Fallback: gunakan garis lurus jika routing gagal
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
          
          // Buat polyline garis lurus sebagai fallback
          polyline = L.polyline([start, end], {
            color: '#FF5733',
            weight: 6,
            opacity: 0.7,
            dashArray: '10, 10',
          }).addTo(map);

          // Hitung jarak garis lurus untuk summary
          if (onRouteFound) {
            const distance = map.distance(L.latLng(start[0], start[1]), L.latLng(end[0], end[1]));
            const estimatedTime = distance / 40 * 3.6; // Asumsi kecepatan 40 km/jam
            onRouteFound({
              totalDistance: distance,
              totalTime: estimatedTime * 60, // konversi ke detik
            });
          }
        })
        .addTo(map);
    } catch (error) {
      console.error("Error creating routing control:", error);
      // Gunakan garis lurus sebagai fallback
      polyline = L.polyline([start, end], {
        color: '#FF5733',
        weight: 6,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);
    }

    return () => {
      if (routingControl) {
        try {
          map.removeControl(routingControl);
        } catch (e) {
          console.warn("Error removing routing control", e);
        }
      }
      if (polyline) {
        map.removeLayer(polyline);
      }
    };
  }, [map, start, end, onRouteFound]);

  return null;
};

export default RoutingMachine;
