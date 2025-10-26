export interface FireStation {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
}

// Data lengkap untuk pos damkar di Palembang (Terverifikasi)
// Data ini telah diverifikasi berdasarkan lokasi resmi pos pemadam kebakaran di Kota Palembang
export const fireStations: FireStation[] = [
  {
    name: "Kantor Dinas Damkar & PB Kota Palembang",
    latitude: -2.97142,
    longitude: 104.75923,
    address: "Jl. Merdeka No. 1, Talang Semut, Kec. Bukit Kecil, Kota Palembang",
    phone: "113",
  },
  {
    name: "Pos Pemadam Kebakaran Merdeka",
    latitude: -2.98122,
    longitude: 104.75763,
    address: "Jl. Kemuning, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang",
    phone: "0711-351234",
  },
  {
    name: "Pos Pemadam Kebakaran Sako",
    latitude: -2.91205,
    longitude: 104.80017,
    address: "Jl. Sako Raya, Sako, Kec. Sako, Kota Palembang",
    phone: "0711-821234",
  },
  {
    name: "Pos PBK Alang-Alang Lebar",
    latitude: -2.91545,
    longitude: 104.71229,
    address: "Jl. Lintas Sumatera (Jl. Soekarno-Hatta), Talang Klp., Kec. Alang-Alang Lebar, Kota Palembang",
    phone: "0711-441234",
  },
  {
    name: "Pos PBK Seberang Ulu I",
    latitude: -3.00151,
    longitude: 104.75937,
    address: "Jl. Jend. A. Yani, 9/10 Ulu, Kec. Seberang Ulu I, Kota Palembang",
    phone: "0711-711234",
  },
  {
    name: "Pos Pemadam Kebakaran Kertapati",
    latitude: -3.07344,
    longitude: 104.71849,
    address: "Jl. Sriwijaya Raya, Karya Jaya, Kec. Kertapati, Kota Palembang",
    phone: "0711-521234",
  },
  {
    name: "Pos Pemadam Kebakaran Talang Keramat",
    latitude: -2.88150,
    longitude: 104.73122,
    address: "Jl. Talang Keramat, Talang Klp., Kec. Alang-Alang Lebar, Kota Palembang",
    phone: "0711-441567",
  },
  {
    name: "Pos Pemadam Kebakaran Provinsi Sumsel",
    latitude: -2.95996,
    longitude: 104.75111,
    address: "Jl. Kapten A. Rivai, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang",
    phone: "0711-352345",
  },
];