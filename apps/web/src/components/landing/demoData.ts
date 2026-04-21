// Demo data for development purposes

export interface KomoditasDetails {
  brix?: string;
  visual?: string[];
  bentuk?: string;
  tekstur?: string[];
  keunggulan?: string[];
}

export interface Komoditas {
  id: string;
  nama: string;
  deskripsi: string;
  foto: string;
  features?: string[];
  jumlah: number;
  satuan: string;
  jenis?: { name: string };
  updated_at: string;
  details?: KomoditasDetails;
  isNew?: boolean;
}

// Shared demo data for the TefaHybrid component and Komoditas page
export const demoData: Komoditas[] = [
  {
    id: '1',
    nama: 'Melon Greenigal',
    deskripsi: 'Melon premium dengan teknologi hidroponik, menghasilkan buah manis dengan net putih yang merata dan rasa yang luar biasa.',
    foto: '/image/melon_greenigal.webp',
    features: ['Net Putih 90%', 'Tangkai Huruf T', 'Buah Keras Merata', 'Brix: 12-15'],
    jumlah: 120,
    satuan: 'Kg',
    jenis: { name: 'Melon' },
    updated_at: '2025-07-15',
    details: {
      brix: '12 - 15',
      visual: [
        'Net berwarna putih, persentase 90%',
        'Tangkai membentuk huruf T, panjang 20cm dari ujung ke ujung',
        'Buah keras merata diseluruh bagian',
        'Tidak ada spot gundul',
        'Tidak ada net berwarna kecoklatan/ hitam',
        'Ukuran 800gr s/d 2000gr'
      ],
      bentuk: 'Bulat Simetris',
      tekstur: [
        'Tekstur daging buah renyah',
        'Kandungan air sedang',
        'Biji kompak',
        'Daging buah tidak berserat'
      ],
      keunggulan: [
        'Daya simpan 10-14 hari pada suhu ruang',
        'Buah tahan terhadap goncangan',
        'Rasa manis merata di seluruh bagian daging buah',
        'Cocok untuk konsumsi segera maupun diolah'
      ]
    }
  },
  {
    id: '2',
    nama: 'Melon Dalmatian',
    deskripsi: 'Varietas melon eksklusif dengan pola net unik seperti dalmatian, daging buah berwarna hijau cerah dengan rasa manis dan segar.',
    foto: '/image/melon_dalmatian.webp',
    features: ['Pola Net Unik', 'Daging Hijau Cerah', 'Aroma Kuat', 'Brix: 13-16'],
    jumlah: 85,
    satuan: 'Kg',
    jenis: { name: 'Melon' },
    updated_at: '2025-07-12',
    details: {
      brix: '13 - 16',
      visual: [
        'Net putih dengan pola unik seperti kulit dalmatian',
        'Tangkai kokoh dengan bentuk T sempurna',
        'Warna kulit kuning keemasan saat matang',
        'Ukuran 1kg s/d 1,8kg'
      ],
      bentuk: 'Bulat Oval',
      tekstur: [
        'Daging buah renyah',
        'Kandungan air tinggi',
        'Tekstur halus tanpa serat',
        'Biji teratur dan kompak'
      ],
      keunggulan: [
        'Aroma khas yang kuat',
        'Ketahanan simpan 7-10 hari',
        'Nilai estetika tinggi karena pola kulit unik',
        'Ideal untuk hidangan pencuci mulut'
      ]
    }
  },
  {
    id: '3',
    nama: 'Melon Greeniesweet',
    deskripsi: 'Melon super manis dengan kandungan gula tinggi, tekstur renyah dan aroma yang memikat. Hasil pengembangan teknologi persilangan terbaik.',
    foto: '/image/melon_greeniesweet.webp',
    features: ['Super Sweet', 'Daging Tebal', 'Kulit Tipis', 'Brix: 15-18'],
    jumlah: 150,
    satuan: 'Kg',
    jenis: { name: 'Melon' },
    updated_at: '2025-07-20',
    details: {
      brix: '15 - 18',
      visual: [
        'Kulit tipis dengan net halus',
        'Warna kulit hijau kekuningan saat matang',
        'Tangkai tebal dan kokoh',
        'Ukuran 1,2kg s/d 2,5kg'
      ],
      bentuk: 'Bulat Sempurna',
      tekstur: [
        'Daging buah sangat tebal',
        'Tekstur renyah dan juicy',
        'Bagian tengah buah kompak',
        'Warna daging hijau muda cerah'
      ],
      keunggulan: [
        'Kadar kemanisan tertinggi dalam kelasnya',
        'Aroma khas yang tahan lama',
        'Daya simpan 12-15 hari dalam kulkas',
        'Ideal untuk jus dan smoothie premium'
      ]
    }
  },
  {
    id: '4',
    nama: 'Melon Aruni',
    deskripsi: 'Melon eksotis dengan kulit keemasan dan daging buah berwarna oranye. Memiliki rasa manis yang khas dengan sentuhan segar.',
    foto: '/image/melon_aruni.webp',
    features: ['Daging Orange', 'Aroma Eksotis', 'Kulit Keemasan', 'Brix: 14-16'],
    jumlah: 95,
    satuan: 'Kg',
    jenis: { name: 'Melon' },
    updated_at: '2025-07-18',
    details: {
      brix: '14 - 16',
      visual: [
        'Kulit berwarna keemasan mengilap',
        'Net tipis dan halus',
        'Warna daging orange cerah',
        'Ukuran 1kg s/d 2kg'
      ],
      bentuk: 'Bulat Lonjong',
      tekstur: [
        'Tekstur lembut dan juicy',
        'Serat halus',
        'Kandungan air tinggi',
        'Biji kecil dan sedikit'
      ],
      keunggulan: [
        'Kandungan beta-karoten tinggi',
        'Rasa manis dengan sentuhan segar',
        'Cocok untuk olahan jus dan salad buah',
        'Daya simpan 7-10 hari pada suhu ruang'
      ]
    }
  },
  {
    id: '5',
    nama: 'Kopi Robusta Premium',
    deskripsi: 'Kopi robusta pilihan dengan cita rasa kuat dan aroma yang khas, ditanam pada ketinggian optimal dan diproses dengan metode semi-wash.',
    foto: '/image/placeholder.webp',
    features: ['Body Kuat', 'Cocoa Finish', 'Low Acidity', 'Medium Roast'],
    jumlah: 75,
    satuan: 'Kg',
    jenis: { name: 'Kopi' },
    updated_at: '2025-07-10',
    details: {
      bentuk: 'Biji Utuh',
      tekstur: [
        'Tekstur biji padat',
        'Ukuran biji seragam',
        'Permukaan halus'
      ],
      keunggulan: [
        'Kadar kafein tinggi',
        'Cocok untuk espresso',
        'Aftertaste yang bertahan lama',
        'Aroma kuat khas robusta'
      ]
    }
  },
  {
    id: '6',
    nama: 'Jamur Tiram Organik',
    deskripsi: 'Jamur tiram segar yang ditanam secara organik, kaya nutrisi dengan tekstur lembut dan rasa yang gurih saat diolah.',
    foto: '/image/placeholder.webp',
    features: ['100% Organik', 'Bebas Pestisida', 'Kaya Protein', 'Fresh Harvest'],
    jumlah: 50,
    satuan: 'Kg',
    jenis: { name: 'Sayuran' },
    updated_at: '2025-07-23',
    details: {
      visual: [
        'Warna putih bersih',
        'Bentuk seperti tiram',
        'Tudung jamur lebar',
        'Batang pendek dan kokoh'
      ],
      tekstur: [
        'Tekstur lembut',
        'Tidak berlendir',
        'Tidak mudah hancur'
      ],
      keunggulan: [
        'Bebas bahan kimia',
        'Dipanen pada tingkat kematangan optimal',
        'Masa simpan 3-5 hari dalam lemari es',
        'Cocok untuk berbagai olahan masakan'
      ]
    }
  },
  {
    id: '7',
    nama: 'Padi Varietas Unggul',
    deskripsi: 'Beras premium hasil pengembangan varietas unggul dengan butiran panjang, wangi pandan, dan tekstur pulen saat dimasak.',
    foto: '/image/placeholder.webp',
    features: ['Butir Panjang', 'Aroma Pandan', 'Pulen', 'Hasil Panen Tinggi'],
    jumlah: 500,
    satuan: 'Kg',
    jenis: { name: 'Pertanian' },
    updated_at: '2025-06-30',
    details: {
      bentuk: 'Butiran Panjang Seragam',
      tekstur: [
        'Butiran keras dan tidak mudah patah',
        'Warna putih bersih',
        'Bebas kutu dan kotoran'
      ],
      keunggulan: [
        'Nasi tetap pulen meski sudah dingin',
        'Rendah gluten',
        'Hasil olahan tidak mudah basi',
        'Cocok untuk nasi putih maupun nasi gurih'
      ]
    }
  },
  {
    id: '8',
    nama: 'Madu Kelengkeng Murni',
    deskripsi: 'Madu premium dari nektar bunga kelengkeng dengan cita rasa khas, tekstur kental, dan warna amber yang menawan.',
    foto: '/image/placeholder.webp',
    features: ['100% Murni', 'Non Pasteurisasi', 'Kental', 'Aroma Khas'],
    jumlah: 120,
    satuan: 'Botol',
    jenis: { name: 'Produk Lebah' },
    updated_at: '2025-07-05',
    details: {
      visual: [
        'Warna amber keemasan',
        'Tekstur kental tidak encer',
        'Tidak berbusa',
        'Tidak mengkristal'
      ],
      tekstur: [
        'Kental dan lengket',
        'Tidak berbutir',
        'Aliran lambat saat dituang'
      ],
      keunggulan: [
        'Aroma bunga kelengkeng yang khas',
        'Tanpa tambahan gula',
        'Kaya antioksidan',
        'Cocok untuk konsumsi langsung atau campuran minuman'
      ]
    }
  },
  {
    id: '9',
    nama: 'Bibit Tomat Hidroponik',
    deskripsi: 'Bibit tomat unggul yang siap tanam dengan metode hidroponik, tahan penyakit dan berpotensi hasil panen tinggi.',
    foto: '/image/placeholder.webp',
    features: ['Tahan Penyakit', 'Fast Growing', 'High Yield', 'Cocok Hidroponik'],
    jumlah: 300,
    satuan: 'Bibit',
    jenis: { name: 'Pembibitan' },
    updated_at: '2025-07-22',
    details: {
      visual: [
        'Batang kokoh dan hijau',
        'Daun lebar dan sehat',
        'Akar putih dan banyak',
        'Tinggi 10-15cm'
      ],
      keunggulan: [
        'Tahan penyakit busuk daun',
        'Buah berukuran besar',
        'Masa panen cepat (60-70 hari)',
        'Adaptasi tinggi terhadap berbagai media tanam'
      ]
    }
  },
  {
    id: '10',
    nama: 'Yoghurt Probiotik',
    deskripsi: 'Yoghurt dengan kandungan probiotik tinggi, dibuat dari susu sapi pilihan dan difermentasi dengan kultur bakteri premium.',
    foto: '/image/placeholder.webp',
    features: ['High Probiotic', 'Low Sugar', 'Creamy Texture', 'No Preservatives'],
    jumlah: 200,
    satuan: 'Botol',
    jenis: { name: 'Olahan Susu' },
    updated_at: '2025-07-21',
    details: {
      visual: [
        'Warna putih bersih',
        'Tekstur kental dan creamy',
        'Tidak berair',
        'Tanpa gumpalan'
      ],
      tekstur: [
        'Lembut di mulut',
        'Kental namun tidak terlalu padat',
        'Sensasi dingin yang menyegarkan'
      ],
      keunggulan: [
        'Kandungan probiotik aktif',
        'Rendah gula dan lemak',
        'Cocok untuk pencernaan sensitif',
        'Masa simpan 14 hari dalam pendingin'
      ]
    }
  }
];
