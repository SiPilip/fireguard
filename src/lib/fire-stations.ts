export interface FireStation {
  name: string;
  latitude: number;
  longitude: number;
}

// Data lengkap untuk pos damkar di Palembang
// Di aplikasi nyata, data ini idealnya datang dari database.
export const fireStations: FireStation[] = [
  {
    name: "Pos Kemuning",
    latitude: -2.9812230886637825,
    longitude: 104.75763792231362,
  },
  {
    name: "Dinas Damkar Pusat",
    latitude: -2.9714235087001772,
    longitude: 104.75923262629334,
  },
  {
    name: "Dinas Damkar Penyelamatan",
    latitude: -2.9748521149168563,
    longitude: 104.76197920814202,
  },
  {
    name: "Pos Pemadam Kebakaran",
    latitude: -2.9760630832514616,
    longitude: 104.77686754954989,
  },
  {
    name: "Pos Damkar Talang Keramat",
    latitude: -2.8815080834342517,
    longitude: 104.73122757326801,
  },
  {
    name: "Pos Sako Sematang Borang",
    latitude: -2.9120574931621666,
    longitude: 104.80017306935339,
  },
  {
    name: "Pemadam Kebakaran Barat",
    latitude: -2.915451821033715,
    longitude: 104.71229183842766,
  },
  {
    name: "Pemadam Kebakaran Selatan",
    latitude: -3.0015147189701854,
    longitude: 104.75937742646806,
  },
  {
    name: "Pos Damkar Kertapati",
    latitude: -3.073448013457011,
    longitude: 104.7184991309698,
  },
  {
    name: "BPB Pemadam Kebakaran",
    latitude: -3.0124227323114314,
    longitude: 104.72914213563348,
  },
  {
    name: "Pos Pemadam AAL",
    latitude: -2.918135401240307,
    longitude: 104.70991606269264,
  },
  {
    name: "Posko Damkar Prov. Sumsel",
    latitude: -2.9599656812502926,
    longitude: 104.751114790423,
  },
];