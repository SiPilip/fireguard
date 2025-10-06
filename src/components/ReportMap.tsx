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
  const [routeSummary, setRouteSummary] = useState<L.Routing.Summary | null>(null);

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

  const nearestStation = useMemo(() => {
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
      onNearestStationFound({
        name: nearestStation.name,
        latitude: nearestStation.latitude,
        longitude: nearestStation.longitude,
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
          >
            <Popup>Lokasi Anda / Laporan</Popup>
          </Marker>
          <ChangeView center={position} />
        </>      
      )}

      {position && nearestStation && (
        <RoutingMachine 
            start={position} 
            end={[nearestStation.latitude, nearestStation.longitude]} 
            onRouteFound={setRouteSummary}
        />
      )}

      {isInteractive && setPosition && <GetLocationButton setPosition={setPosition} />}
    </MapContainer>
  );
}
