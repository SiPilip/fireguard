
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fireStations, FireStation } from '@/lib/fire-stations';
import RoutingMachine from './RoutingMachine';
import { useMemo } from 'react';

// Definisikan tipe untuk Laporan
interface Report {
  id: number;
  phone_number: string;
  fire_latitude: number;
  fire_longitude: number;
  reporter_latitude?: number;
  reporter_longitude?: number;
  status: string;
  created_at: string;
  media_url: string;
  notes?: string;
  contact?: string;
  acknowledged?: boolean;
}

// Ikon untuk Pos Damkar
const fireStationIcon = new L.DivIcon({
    html: `<div style="font-size: 24px;">🚒</div>`,
    className: 'leaflet-emoji-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

// Ikon untuk lokasi kebakaran
const fireLocationIcon = new L.DivIcon({
    html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🔥</div>`,
    className: 'leaflet-emoji-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});

// Ikon untuk lokasi pelapor
const reporterLocationIcon = new L.DivIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
    className: 'leaflet-emoji-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

interface AdminMapProps {
    reports: Report[];
    onReportClick: (report: Report) => void;
    selectedReport?: Report | null;
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

export default function AdminMap({ reports, onReportClick, selectedReport }: AdminMapProps) {
  const defaultPosition: [number, number] = [-2.976, 104.775]; // Palembang

  // Hitung pos damkar terdekat untuk laporan yang dipilih
  const nearestStation: FireStation | null = useMemo(() => {
    if (!selectedReport) return null;
    
    const firePos: [number, number] = [selectedReport.fire_latitude, selectedReport.fire_longitude];
    let closest: FireStation | null = null;
    let minDistance = Infinity;

    fireStations.forEach(station => {
        const distance = haversineDistance(firePos, [station.latitude, station.longitude]);
        if (distance < minDistance) {
            minDistance = distance;
            closest = station;
        }
    });
    return closest;
  }, [selectedReport]);

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
        <>
          {/* Marker lokasi kebakaran */}
          <Marker
            key={`fire-${report.id}`}
            position={[report.fire_latitude, report.fire_longitude]}
            icon={fireLocationIcon}
            eventHandlers={{
                click: () => {
                    onReportClick(report);
                }
            }}
          >
            <Popup>
                <strong>🔥 Lokasi Kebakaran</strong><br />
                Laporan #{report.id} <br />
                Status: {report.status}
            </Popup>
          </Marker>
          
          {/* Marker lokasi pelapor jika ada */}
          {report.reporter_latitude && report.reporter_longitude && (
            <Marker
              key={`reporter-${report.id}`}
              position={[report.reporter_latitude, report.reporter_longitude]}
              icon={reporterLocationIcon}
              eventHandlers={{
                  click: () => {
                      onReportClick(report);
                  }
              }}
            >
              <Popup>
                  <strong>📍 Lokasi Pelapor</strong><br />
                  Laporan #{report.id}
              </Popup>
            </Marker>
          )}
        </>
      ))}

      {/* Tampilkan rute dari pos damkar terdekat ke lokasi kebakaran untuk laporan yang dipilih */}
      {selectedReport && nearestStation && (
        <RoutingMachine 
          start={[(nearestStation as FireStation).latitude, (nearestStation as FireStation).longitude]}
          end={[selectedReport.fire_latitude, selectedReport.fire_longitude]}
        />
      )}
    </MapContainer>
  );
}
