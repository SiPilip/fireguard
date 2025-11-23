import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
  onRouteFound?: (summary: any) => void;
}

const RoutingMachine = ({ start, end, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();

  // Memoize coordinates to prevent unnecessary re-renders
  const startCoords = useMemo(() => start, [start[0], start[1]]);
  const endCoords = useMemo(() => end, [end[0], end[1]]);

  useEffect(() => {
    if (!map) return;

    let polyline: L.Polyline | null = null;
    let timeoutId: NodeJS.Timeout;
    let fetchTimeoutId: NodeJS.Timeout;

    const fetchRoute = async () => {
      try {
        // Validasi koordinat
        if (!startCoords || !endCoords || startCoords.length !== 2 || endCoords.length !== 2) {
          return;
        }

        // PENTING: start dan end sudah dalam format [lat, lng] dari Leaflet
        // OSRM API membutuhkan format: longitude,latitude (dibalik!)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&alternatives=false&steps=true&annotations=true`;

        console.log('🗺️ Fetching route:', {
          from: `Lat: ${startCoords[0]}, Lng: ${startCoords[1]}`,
          to: `Lat: ${endCoords[0]}, Lng: ${endCoords[1]}`
        });

        // Fetch dengan timeout manual
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

        const response = await fetch(osrmUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`OSRM API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates;

          if (!coordinates || coordinates.length === 0) {
            throw new Error('No coordinates in route geometry');
          }

          // PENTING: OSRM mengembalikan koordinat dalam format [lng, lat]
          // Leaflet membutuhkan format [lat, lng], jadi harus dibalik!
          const latlngs: L.LatLngExpression[] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);

          // Hapus polyline lama jika ada (meskipun cleanup function sudah handle, ini double check)
          if (polyline) {
            map.removeLayer(polyline);
          }

          // Buat polyline dengan rute yang sebenarnya mengikuti jalan
          polyline = L.polyline(latlngs, {
            color: '#EF4444', // Red-500
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            dashArray: '0',
          }).addTo(map);

          // Fit bounds ke rute dengan padding yang pas
          const bounds = polyline.getBounds();
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 1
          });

          // Kirim summary ke parent component
          if (onRouteFound) {
            onRouteFound({
              totalDistance: route.distance, // dalam meter
              totalTime: route.duration, // dalam detik
            });
          }

          console.log('✅ Route found successfully');
        } else {
          throw new Error(data.message || 'No route found');
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('❌ Error fetching route:', error.message);

        // Fallback: gunakan garis lurus jika routing gagal
        // Tapi beri delay sedikit sebelum fallback agar tidak flickering jika hanya lag sebentar
        console.warn('⚠️ Using straight line fallback');

        if (polyline) map.removeLayer(polyline);

        polyline = L.polyline([startCoords, endCoords], {
          color: '#EF4444',
          weight: 4,
          opacity: 0.5,
          dashArray: '10, 10',
        }).addTo(map);

        const bounds = L.latLngBounds([startCoords, endCoords]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    };

    // Debounce fetch untuk menghindari spam request saat drag cepat
    fetchTimeoutId = setTimeout(fetchRoute, 500);

    return () => {
      if (polyline) {
        map.removeLayer(polyline);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (fetchTimeoutId) {
        clearTimeout(fetchTimeoutId);
      }
    };
  }, [map, startCoords, endCoords, onRouteFound]);

  return null;
};

export default RoutingMachine;
