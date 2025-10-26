export interface FireStation {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
}

// Data lengkap untuk pos damkar di Palembang
// Di aplikasi nyata, data ini idealnya datang dari database.
export const fireStations: FireStation[] = [
  {
    name: "Pos Kemuning",
    latitude: -2.9812230886637825,
    longitude: 104.75763792231362,
    address: "Jl. Kemuning, Palembang",
    phone: "0711-123456",
  },
  {
    name: "Dinas Damkar Pusat",
    latitude: -2.9714235087001772,
    longitude: 104.75923262629334,
    address: "Jl. Merdeka, Palembang",
    phone: "113",
  },
  {
    name: "Dinas Damkar Penyelamatan",
    latitude: -2.9748521149168563,
    longitude: 104.76197920814202,
    address: "Jl. Veteran, Palembang",
    phone: "0711-234567",
  },
  {
    name: "Pos Pemadam Kebakaran",
    latitude: -2.9760630832514616,
    longitude: 104.77686754954989,
    address: "Jl. Sudirman, Palembang",
    phone: "0711-345678",
  },
  {
    name: "Pos Damkar Talang Keramat",
    latitude: -2.8815080834342517,
    longitude: 104.73122757326801,
    address: "Jl. Talang Keramat, Palembang",
    phone: "0711-456789",
  },
  {
    name: "Pos Sako Sematang Borang",
    latitude: -2.9120574931621666,
    longitude: 104.80017306935339,
    address: "Jl. Sako, Palembang",
    phone: "0711-567890",
  },
  {
    name: "Pemadam Kebakaran Barat",
    latitude: -2.915451821033715,
    longitude: 104.71229183842766,
    address: "Jl. Basuki Rahmat, Palembang Barat",
    phone: "0711-678901",
  },
  {
    name: "Pemadam Kebakaran Selatan",
    latitude: -3.0015147189701854,
    longitude: 104.75937742646806,
    address: "Jl. Angkatan 45, Palembang Selatan",
    phone: "0711-789012",
  },
  {
    name: "Pos Damkar Kertapati",
    latitude: -3.073448013457011,
    longitude: 104.7184991309698,
    address: "Jl. Kertapati, Palembang",
    phone: "0711-890123",
  },
  {
    name: "BPB Pemadam Kebakaran",
    latitude: -3.0124227323114314,
    longitude: 104.72914213563348,
    address: "Jl. BPB, Palembang",
    phone: "0711-901234",
  },
  {
    name: "Pos Pemadam AAL",
    latitude: -2.918135401240307,
    longitude: 104.70991606269264,
    address: "Jl. AAL, Palembang",
    phone: "0711-012345",
  },
  {
    name: "Posko Damkar Prov. Sumsel",
    latitude: -2.9599656812502926,
    longitude: 104.751114790423,
    address: "Jl. Gubernuran, Palembang",
    phone: "0711-112233",
  },
];