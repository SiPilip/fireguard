import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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

// Fungsi untuk membuat icon berdasarkan kategori bencana
const createCategoryIcon = (categoryId: number, categoryIcon?: string) => {
  // Default emoji berdasarkan categoryId
  const categoryEmojis: Record<number, { emoji: string; color: string }> = {
    1: { emoji: '🔥', color: 'rgba(239, 68, 68, 0.3)' },  // Kebakaran
    2: { emoji: '🏗️', color: 'rgba(245, 158, 11, 0.3)' }, // Kerusakan Infrastruktur
    3: { emoji: '🌊', color: 'rgba(59, 130, 246, 0.3)' },  // Banjir
    4: { emoji: '🌪️', color: 'rgba(139, 92, 246, 0.3)' },  // Angin Puting Beliung
    5: { emoji: '⛰️', color: 'rgba(120, 53, 15, 0.3)' },   // Tanah Longsor
    6: { emoji: '⚠️', color: 'rgba(234, 179, 8, 0.3)' },   // Kecelakaan
    7: { emoji: '🚨', color: 'rgba(220, 38, 38, 0.3)' },   // Lainnya
  };

  const config = categoryEmojis[categoryId] || { emoji: categoryIcon || '📍', color: 'rgba(107, 114, 128, 0.3)' };
  const emoji = categoryIcon || config.emoji;
  const color = config.color;

  return new L.DivIcon({
    html: `
        <div style="position: relative; width: 40px; height: 40px;">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                background-color: ${color};
                border-radius: 50%;
                animation: pulse-category 2s infinite;
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
            ">${emoji}</div>
        </div>
        <style>
            @keyframes pulse-category {
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
    className: 'leaflet-category-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};


// Ikon untuk lokasi pelapor
const reporterLocationIcon = new L.DivIcon({
  html: `
        <div style="position: relative; width: 36px; height: 36px;">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                background-color: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                animation: pulse-reporter 2s infinite;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 28px;
                text-align: center;
                line-height: 28px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            ">📍</div>
        </div>
        <style>
            @keyframes pulse-reporter {
                0%, 100% {
                    width: 24px;
                    height: 24px;
                    opacity: 1;
                }
                50% {
                    width: 38px;
                    height: 38px;
                    opacity: 0.5;
                }
            }
        </style>
    `,
  className: 'leaflet-reporter-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Komponen untuk mengubah view peta saat posisi berubah
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

// Komponen untuk handle klik pada peta
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

// Komponen untuk kontrol mendapatkan lokasi
function GetLocationButton({
  setFirePosition,
  setReporterPosition
}: {
  setFirePosition: (position: [number, number]) => void;
  setReporterPosition?: (position: [number, number]) => void;
}) {
  const map = useMap();
  const [isLoadingFire, setIsLoadingFire] = useState(false);
  const [isLoadingReporter, setIsLoadingReporter] = useState(false);

  const handleGetFireLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsLoadingFire(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setFirePosition(newPos);
          map.setView(newPos, 16);
          setIsLoadingFire(false);
        },
        (error) => {
          alert('Tidak dapat mengambil lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
          setIsLoadingFire(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Browser tidak mendukung geolocation');
      setIsLoadingFire(false);
    }
  };

  const handleGetReporterLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!setReporterPosition) return;

    setIsLoadingReporter(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setReporterPosition(newPos);
          setIsLoadingReporter(false);
        },
        (error) => {
          alert('Tidak dapat mengambil lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
          setIsLoadingReporter(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Browser tidak mendukung geolocation');
      setIsLoadingReporter(false);
    }
  };

  return (
    <div
      className="leaflet-top leaflet-left"
      style={{ marginTop: '10px', marginLeft: '50px', pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="leaflet-control"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto'
        }}
      >
        {/* Tombol Lokasi Kejadian */}
        <button
          onClick={handleGetFireLocation}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isLoadingFire}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white transition-colors rounded-lg shadow-lg"
          style={{
            padding: '8px 14px',
            border: 'none',
            cursor: isLoadingFire ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'auto',
          }}
          title="Set lokasi kejadian ke lokasi GPS Anda"
        >
          <span style={{ fontSize: '16px' }}>{isLoadingFire ? '⏳' : '🔥'}</span>
          <span>Lokasi Kejadian</span>
        </button>

        {/* Tombol Lokasi Saya */}
        {setReporterPosition && (
          <button
            onClick={handleGetReporterLocation}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isLoadingReporter}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white transition-colors rounded-lg shadow-lg"
            style={{
              padding: '8px 14px',
              border: 'none',
              cursor: isLoadingReporter ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
            }}
            title="Set lokasi pelapor ke lokasi GPS Anda"
          >
            <span style={{ fontSize: '16px' }}>{isLoadingReporter ? '⏳' : '📍'}</span>
            <span>Lokasi Saya</span>
          </button>
        )}
      </div>
    </div>
  );
}



// Fungsi untuk menghitung jarak Haversine (jarak garis lurus) - fallback only
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
  firePosition: [number, number] | null;
  setFirePosition?: (position: [number, number]) => void;
  reporterPosition?: [number, number] | null;
  setReporterPosition?: (position: [number, number]) => void;
  onNearestStationFound?: (info: NearestStationInfo | null) => void;
  categoryId?: number; // ID kategori bencana
  categoryIcon?: string; // Emoji icon dari kategori
}

// ... (Komponen ChangeView, GetLocationButton, createEmojiIcon, haversineDistance tetap sama)

export default function ReportMap({ firePosition, setFirePosition, reporterPosition, setReporterPosition, onNearestStationFound, categoryId = 1, categoryIcon }: ReportMapProps) {
  const defaultPosition: [number, number] = [-2.976, 104.775];
  const [routeSummary, setRouteSummary] = useState<any>(null);
  const [nearestStation, setNearestStation] = useState<FireStation | null>(null);
  const [isCalculatingNearest, setIsCalculatingNearest] = useState(false);
  const onNearestStationFoundRef = useRef(onNearestStationFound);

  // Update ref when callback changes
  useEffect(() => {
    onNearestStationFoundRef.current = onNearestStationFound;
  }, [onNearestStationFound]);

  const fireEventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        if (setFirePosition) {
          const { lat, lng } = e.target.getLatLng();
          setFirePosition([lat, lng]);
        }
      },
    }),
    [setFirePosition],
  );

  const reporterEventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        if (setReporterPosition) {
          const { lat, lng } = e.target.getLatLng();
          setReporterPosition([lat, lng]);
        }
      },
    }),
    [setReporterPosition],
  );

  // Effect untuk menghitung pos damkar terdekat
  useEffect(() => {
    if (!firePosition) {
      setNearestStation(null);
      setRouteSummary(null);
      if (onNearestStationFoundRef.current) {
        onNearestStationFoundRef.current(null);
      }
      return;
    }

    setIsCalculatingNearest(true);

    // Gunakan Haversine distance untuk mencari pos terdekat
    let closest: FireStation | null = null;
    let minDistance = Infinity;

    fireStations.forEach(station => {
      const distance = haversineDistance(firePosition, [station.latitude, station.longitude]);
      if (distance < minDistance) {
        minDistance = distance;
        closest = station;
      }
    });

    if (closest) {
      setNearestStation(closest);
      const distanceInMeters = minDistance * 1000;
      const durationInSeconds = (minDistance / 40) * 3600;

      setRouteSummary({
        totalDistance: distanceInMeters,
        totalTime: durationInSeconds,
      });
    }

    setIsCalculatingNearest(false);
  }, [firePosition]);

  // Effect untuk mengirim info nearest station ke parent
  useEffect(() => {
    if (nearestStation && routeSummary && onNearestStationFoundRef.current) {
      onNearestStationFoundRef.current({
        name: nearestStation.name,
        latitude: nearestStation.latitude,
        longitude: nearestStation.longitude,
        distance: routeSummary.totalDistance,
        time: routeSummary.totalTime,
      });
    }
  }, [nearestStation, routeSummary]);


  const isInteractive = !!setFirePosition;

  // Handler untuk klik pada peta
  const handleMapClick = (latlng: [number, number]) => {
    if (setFirePosition) {
      setFirePosition(latlng);
    }
  };

  return (
    <>
      {isCalculatingNearest && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">Mencari pos damkar terdekat...</span>
        </div>
      )}
      <MapContainer center={firePosition || reporterPosition || defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Handler untuk klik pada peta */}
        {isInteractive && <MapClickHandler onMapClick={handleMapClick} />}

        {fireStations.map(station => (
          <Marker
            key={station.name}
            position={[station.latitude, station.longitude]}
            icon={fireStationIcon}
          >
            <Popup>{station.name}</Popup>
          </Marker>
        ))}

        {firePosition && (
          <>
            <Marker
              position={firePosition}
              draggable={isInteractive}
              eventHandlers={isInteractive ? fireEventHandlers : undefined}
              icon={createCategoryIcon(categoryId, categoryIcon)}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-600">📍 Lokasi Kejadian</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {firePosition[0].toFixed(6)}, {firePosition[1].toFixed(6)}
                  </p>
                  {isInteractive && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Seret marker untuk ubah lokasi
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            {/* Hanya gunakan ChangeView jika belum ada rute, agar tidak konflik dengan fitBounds rute */}
            {!nearestStation && <ChangeView center={firePosition} />}
          </>
        )}

        {reporterPosition && (
          <Marker
            position={reporterPosition}
            draggable={isInteractive && !!setReporterPosition}
            eventHandlers={isInteractive && setReporterPosition ? reporterEventHandlers : undefined}
            icon={reporterLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-blue-600">📍 Lokasi Pelapor</p>
                <p className="text-xs text-gray-600 mt-1">
                  {reporterPosition[0].toFixed(6)}, {reporterPosition[1].toFixed(6)}
                </p>
                {isInteractive && setReporterPosition && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Seret marker untuk ubah lokasi
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {firePosition && nearestStation && (
          <RoutingMachine
            start={[nearestStation.latitude, nearestStation.longitude]}
            end={firePosition}
            onRouteFound={setRouteSummary}
          />
        )}
      </MapContainer>
    </>
  );
}
