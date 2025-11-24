import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
  onRouteFound?: (summary: { totalDistance: number; totalTime: number }) => void;
}

const RoutingMachine = ({ start, end, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;

    let polyline: L.Polyline | null = null;
    let animatedPolyline: L.Polyline | null = null;
    let movingMarker: L.Marker | null = null;
    let timeoutId: NodeJS.Timeout;

    // Icon untuk marker yang bergerak (mobil pemadam)
    const truckIcon = L.divIcon({
      html: `
        <div style="
          font-size: 24px;
          text-align: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
          animation: bounce 1s infinite;
        ">🚒</div>
        <style>
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        </style>
      `,
      className: 'moving-truck-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Fungsi untuk animasi route seperti Gojek
    const animateRoute = (coordinates: L.LatLngExpression[], duration: number = 2500) => {
      const startTime = Date.now();
      const totalPoints = coordinates.length;
      
      // Buat polyline untuk animasi
      animatedPolyline = L.polyline([], {
        color: '#EF4444',
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);

      // Tambahkan marker mobil pemadam yang bergerak
      movingMarker = L.marker(coordinates[0] as L.LatLngExpression, {
        icon: truckIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      // Fungsi animasi frame by frame
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function untuk animasi smooth (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Hitung berapa banyak point yang harus ditampilkan
        const currentPointIndex = Math.floor(easeProgress * totalPoints);
        
        // Update polyline dengan koordinat sampai index saat ini
        const currentCoords = coordinates.slice(0, currentPointIndex + 1);
        animatedPolyline?.setLatLngs(currentCoords);
        
        // Update posisi marker mobil pemadam
        if (currentPointIndex < totalPoints && movingMarker) {
          movingMarker.setLatLng(coordinates[currentPointIndex] as L.LatLngExpression);
        }
        
        if (progress < 1) {
          // Lanjutkan animasi
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animasi selesai - hapus marker
          if (movingMarker) {
            map.removeLayer(movingMarker);
            movingMarker = null;
          }
          console.log('✨ Route animation completed');
        }
      };

      // Mulai animasi
      animate();
    };

    const fetchRoute = async () => {
      try {
        // Validasi koordinat
        if (!start || !end || start.length !== 2 || end.length !== 2) {
          return;
        }

        // PENTING: start dan end sudah dalam format [lat, lng] dari Leaflet
        // OSRM API membutuhkan format: longitude,latitude (dibalik!)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=false&steps=true&annotations=true`;

        console.log('🗺️ Fetching animated route...');

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

          // Hapus polyline lama jika ada
          if (polyline) {
            map.removeLayer(polyline);
          }
          if (animatedPolyline) {
            map.removeLayer(animatedPolyline);
          }
          if (movingMarker) {
            map.removeLayer(movingMarker);
          }

          console.log(`🎬 Starting route animation with ${coordinates.length} points...`);
          
          // Mulai animasi route (durasi 2.5 detik)
          animateRoute(latlngs, 2500);
          
          // Fit bounds ke rute dengan animasi smooth
          const tempPolyline = L.polyline(latlngs);
          const bounds = tempPolyline.getBounds();
          map.fitBounds(bounds, {
            padding: [80, 80],
            maxZoom: 15,
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
          
          console.log('✅ Route animation initialized:', {
            distance: `${(route.distance / 1000).toFixed(2)} km`,
            duration: `${Math.round(route.duration / 60)} menit`,
            points: coordinates.length,
          });
        } else {
          throw new Error(data.message || 'No route found');
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return;

        // Fallback: gunakan garis lurus jika routing gagal
        if (polyline) map.removeLayer(polyline);

        polyline = L.polyline([start, end], {
          color: '#EF4444',
          weight: 4,
          opacity: 0.5,
          dashArray: '10, 10',
        }).addTo(map);

        const bounds = L.latLngBounds([start, end]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    };

    // Debounce fetch untuk menghindari spam request saat drag cepat
    const fetchTimeoutId = setTimeout(fetchRoute, 500);

    return () => {
      // Cleanup: hapus polyline dan stop animasi
      if (polyline) {
        map.removeLayer(polyline);
      }
      if (animatedPolyline) {
        map.removeLayer(animatedPolyline);
      }
      if (movingMarker) {
        map.removeLayer(movingMarker);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (fetchTimeoutId) {
        clearTimeout(fetchTimeoutId);
      }
    };
  }, [map, start, end, onRouteFound]);

  return null;
};

export default RoutingMachine;
