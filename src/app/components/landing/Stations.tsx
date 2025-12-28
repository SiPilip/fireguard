'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaPhone, FaFire } from 'react-icons/fa';

// Dynamic import untuk map
const StationsMap = dynamic(() => import('../../../components/StationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-xl">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat Peta...</p>
      </div>
    </div>
  ),
});

// Import data pos damkar
import { fireStations } from '@/lib/fire-stations';

const StationCard = ({ station, index }: { station: any; index: number }) => {
  return (
    <div
      className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
          <FaFire className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{station.name}</h3>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">{station.address}</p>
            </div>
            {station.phone && (
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-400 text-xs" />
                <p className="text-xs text-gray-600">{station.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stations = () => {
  const [selectedStation, setSelectedStation] = useState<any>(null);

  return (
    <section id="stations" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Lokasi Pos Damkar</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pos Pemadam Kebakaran Plaju, Palembang</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Terdapat {fireStations.length} pos damkar yang siap melayani masyarakat Plaju, Palembang 24/7
          </p>
        </div>

        {/* Map & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="h-[500px] w-full">
              <StationsMap
                stations={fireStations}
                selectedStation={selectedStation}
                onStationClick={setSelectedStation}
              />
            </div>
          </div>

          {/* Station List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl h-[500px] overflow-y-auto">
              <h3 className="text-base font-semibold text-gray-900 sticky top-0 bg-gray-50 py-5 px-5 z-10 -mt-0">
                Daftar Pos Damkar ({fireStations.length})
              </h3>
              <div className="px-5 pb-5">
                <div className="space-y-3">
                  {fireStations.map((station, index) => (
                    <div
                      key={station.name}
                      onClick={() => setSelectedStation(station)}
                      className="cursor-pointer"
                    >
                      <StationCard station={station} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-sm">
              <FaFire className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Layanan Darurat 24/7</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Semua pos damkar Plaju, Palembang siap melayani panggilan darurat kapan saja.
                Hubungi <span className="font-semibold text-red-600">113</span> atau gunakan aplikasi ini untuk melapor kebakaran.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stations;
