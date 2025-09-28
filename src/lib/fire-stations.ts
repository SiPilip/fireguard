export interface FireStation {
  name: string;
  latitude: number;
  longitude: number;
}

// Data contoh untuk beberapa pos damkar di Palembang
// Di aplikasi nyata, data ini idealnya datang dari database.
export const fireStations: FireStation[] = [
  {
    name: 'Pos Damkar Merdeka',
    latitude: -2.9828,
    longitude: 104.753,
  },
  {
    name: 'Pos Damkar Sako',
    latitude: -2.945,
    longitude: 104.801,
  },
  {
    name: 'Pos Damkar Seberang Ulu',
    latitude: -3.001,
    longitude: 104.765,
  },
];
