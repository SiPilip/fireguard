
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fireStations } from '@/lib/fire-stations';

// Definisikan tipe untuk Laporan
interface Report {
  id: number;
  latitude: number;
  longitude: number;
  status: string;
}

// Ikon untuk Pos Damkar
const fireStationIcon = new L.DivIcon({
    html: `<div style="font-size: 24px;">🚒</div>`,
    className: 'leaflet-emoji-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

// Fungsi untuk mendapatkan ikon laporan berdasarkan status
const getReportIcon = (status: string) => {
    const icons: { [key: string]: string } = {
        'submitted': '🔥', // Laporan baru
        'verified': '⚠️', // Diverifikasi
        'dispatched': '🚛', // Unit dikirim
        'arrived': '✅',    // Unit tiba
        'completed': '🏁', // Selesai
        'false': '❌',      // Laporan palsu
    };
    const emoji = icons[status] || '❓'; // Default jika status tidak dikenal
    return new L.DivIcon({
        html: `<div style="font-size: 24px;">${emoji}</div>`,
        className: 'leaflet-emoji-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

interface AdminMapProps {
    reports: Report[];
    onReportClick: (report: Report) => void;
}

export default function AdminMap({ reports, onReportClick }: AdminMapProps) {
  const defaultPosition: [number, number] = [-2.976, 104.775]; // Palembang

  return (
    <MapContainer center={defaultPosition} zoom={12} style={{ height: '100%', width: '100%', backgroundColor: '#374151' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Tampilkan semua pos damkar */}
      {fireStations.map(station => (
        <Marker 
            key={`station-${station.name}`}
            position={[station.latitude, station.longitude]} 
            icon={fireStationIcon}
        >
            <Popup>{station.name}</Popup>
        </Marker>
      ))}

      {/* Tampilkan semua laporan */}
      {reports.map(report => (
          <Marker
            key={`report-${report.id}`}
            position={[report.latitude, report.longitude]}
            icon={getReportIcon(report.status)}
            eventHandlers={{
                click: () => {
                    onReportClick(report);
                }
            }}
          >
            <Popup>
                Laporan #{report.id} <br />
                Status: {report.status}
            </Popup>
          </Marker>
      ))}
    </MapContainer>
  );
}
