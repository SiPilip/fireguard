'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix untuk ikon marker yang tidak muncul di React-Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ReportMapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}

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

export default function ReportMap({ position, setPosition }: ReportMapProps) {
  const defaultPosition: [number, number] = [-2.976, 104.775]; // Default: Palembang

  return (
    <MapContainer center={position || defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {position && (
        <>
          <Marker position={position}></Marker>
          <ChangeView center={position} />
        </>      
      )}
      <GetLocationButton setPosition={setPosition} />
    </MapContainer>
  );
}
