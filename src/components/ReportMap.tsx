import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo, useState, useEffect } from 'react';
import { fireStations, FireStation } from '@/lib/fire-stations';
import RoutingMachine from './RoutingMachine';

// Fungsi untuk membuat ikon emoji yang ukurannya bisa diatur
const createEmojiIcon = (emoji: string, size: number) => {
    return new L.DivIcon({
        html: `<div style="font-size: ${size}px; text-align: center; line-height: ${size}px;">${emoji}</div>`,
        className: 'leaflet-emoji-icon', // class-name untuk styling jika perlu
        iconSize: [size, size],
        iconAnchor: [size / 2, size], // Anchor di tengah bawah
    });
};

// Ikon kustom untuk pos damkar menggunakan emoji
const fireStationIcon = createEmojiIcon('🚒', 30); // Emoji pemadam kebakaran, ukuran 30px

// Ikon untuk lokasi kebakaran/laporan (dengan animasi pulse)
const fireLocationIcon = new L.DivIcon({
    html: `
        <div style="position: relative; width: 40px; height: 40px;">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                background-color: rgba(239, 68, 68, 0.3);
                border-radius: 50%;
                animation: pulse-fire 2s infinite;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                text-align: center;
                line-height: 32px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            ">🔥</div>
        </div>
        <style>
            @keyframes pulse-fire {
                0%, 100% {
                    width: 30px;
                    height: 30px;
                    opacity: 1;
                }
                50% {
                    width: 45px;
                    height: 45px;
                    opacity: 0.5;
                }
            }
        </style>
    `,
    className: 'leaflet-fire-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Komponen untuk mengubah view peta saat posisi berubah
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

// Komponen untuk kontrol mendapatkan lokasi
function GetLocationButton({ setPosition }: { setPosition: (position: [number, number]) => void }) {
  const map = useMap();

  const handleClick = () => {
    map.locate().on('locationfound', function (e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(e.latlng, 16);
    }).on('locationerror', function(e){
        alert(e.message);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute top-2 right-2 z-[1000] rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-md hover:bg-gray-100"
    >
      Dapatkan Lokasi Saya
    </button>
  );
}

// Fungsi untuk menghitung jarak Haversine (jarak garis lurus)
function haversineDistance(coords1: [number, number], coords2: [number, number]): number {
    function toRad(x: number): number {
        return x * Math.PI / 180;
    }

    const R = 6371; // Radius bumi dalam km
    const dLat = toRad(coords2[0] - coords1[0]);
    const dLon = toRad(coords2[1] - coords1[1]);
    const lat1 = toRad(coords1[0]);
    const lat2 = toRad(coords2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


export interface NearestStationInfo {
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // dalam meter
  time: number; // dalam detik
}

interface ReportMapProps {
  position: [number, number] | null;
  setPosition?: (position: [number, number]) => void;
  onNearestStationFound?: (info: NearestStationInfo | null) => void;
}

// ... (Komponen ChangeView, GetLocationButton, createEmojiIcon, haversineDistance tetap sama)

export default function ReportMap({ position, setPosition, onNearestStationFound }: ReportMapProps) {
  const defaultPosition: [number, number] = [-2.976, 104.775];
  const [routeSummary, setRouteSummary] = useState<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        if (setPosition) {
            const { lat, lng } = e.target.getLatLng();
            setPosition([lat, lng]);
        }
      },
    }),
    [setPosition],
  );

  const nearestStation: FireStation | null = useMemo(() => {
    if (!position) return null;
    let closest: FireStation | null = null;
    let minDistance = Infinity;

    fireStations.forEach(station => {
        const distance = haversineDistance(position, [station.latitude, station.longitude]);
        if (distance < minDistance) {
            minDistance = distance;
            closest = station;
        }
    });
    return closest;
  }, [position]);

  useEffect(() => {
    if (nearestStation && routeSummary && onNearestStationFound) {
      const station = nearestStation as FireStation;
      onNearestStationFound({
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        distance: routeSummary.totalDistance,
        time: routeSummary.totalTime,
      });
    } else if (onNearestStationFound) {
      onNearestStationFound(null);
    }
  }, [nearestStation, routeSummary, onNearestStationFound]);


  const isInteractive = !!setPosition;

  return (
    <MapContainer center={position || defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {fireStations.map(station => (
        <Marker 
            key={station.name} 
            position={[station.latitude, station.longitude]} 
            icon={fireStationIcon}
        >
            <Popup>{station.name}</Popup>
        </Marker>
      ))}

      {position && (
        <>
          <Marker 
            position={position}
            draggable={isInteractive}
            eventHandlers={isInteractive ? eventHandlers : undefined}
            icon={fireLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">🔥 Lokasi Kebakaran</p>
                <p className="text-xs text-gray-600 mt-1">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
                {isInteractive && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Seret marker untuk ubah lokasi
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
          <ChangeView center={position} />
        </>      
      )}

      {position && nearestStation && (
        <RoutingMachine 
            start={position} 
            end={[(nearestStation as FireStation).latitude, (nearestStation as FireStation).longitude]} 
            onRouteFound={setRouteSummary}
        />
      )}

      {isInteractive && setPosition && <GetLocationButton setPosition={setPosition} />}
    </MapContainer>
  );
}
