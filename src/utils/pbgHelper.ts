import { FungsiBangunan, Kompleksitas, ChecklistItem, RetribusiCalculation } from "../types";

export function generateDefaultChecklist(
  fungsi: FungsiBangunan,
  kompleksitas: Kompleksitas,
  jumlahLantai: number,
  luasBangunan: number
): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];

  // 1. DOKUMEN ADMINISTRATIF
  checklist.push({
    id: "adm-ktp",
    category: "administratif",
    title: "KTP / Identitas Pemohon",
    description: "Kartu Tanda Penduduk atau kartu identitas resmi pemohon (pemilik bangunan).",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "adm-sertifikat",
    category: "administratif",
    title: "Sertifikat Tanah / Bukti Kepemilikan",
    description: "Sertifikat Hak Milik (SHM), HGB, atau bukti kepemilikan tanah yang sah dan tidak dalam sengketa.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "adm-kkpr",
    category: "administratif",
    title: "KKPR / KRK (Kesesuaian Tata Ruang)",
    description: "Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) atau Keterangan Rencana Kabupaten/Kota (KRK) dari dinas terkait.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "adm-spjm",
    category: "administratif",
    title: "SPJM (Surat Pertanggungjawaban Mutlak)",
    description: "Surat pernyataan dari pemilik bahwa seluruh data dokumen adalah benar dan bertanggung jawab atas kekuatan struktur.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "adm-pbb",
    category: "administratif",
    title: "Bukti Bayar PBB Terakhir",
    description: "Bukti pelunasan Pajak Bumi dan Bangunan (PBB) tahun berjalan.",
    required: false,
    checked: false,
  });

  // Jika bangunan bukan milik pemilik tanah
  checklist.push({
    id: "adm-perjanjian",
    category: "administratif",
    title: "Surat Perjanjian Pemanfaatan Tanah",
    description: "Diperlukan jika nama di sertifikat tanah berbeda dengan nama pemohon PBG (Sewa/Pinjam Pakai/Hibah).",
    required: false,
    checked: false,
  });

  // 2. DOKUMEN ARSITEKTUR
  checklist.push({
    id: "ars-siteplan",
    category: "arsitektur",
    title: "Gambar Rencana Tapak / Site Plan",
    description: "Gambar situasi bangunan pada tanah, menunjukkan batas tanah, GSB (Garis Sempadan Bangunan), dan akses jalan.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "ars-denah",
    category: "arsitektur",
    title: "Gambar Denah Lengkap per Lantai",
    description: "Menunjukkan tata letak ruang, ukuran, dan penamaan ruangan di setiap lantai bangunan.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "ars-tampak",
    category: "arsitektur",
    title: "Gambar Tampak (Minimal 2 Arah)",
    description: "Tampak Depan, Belakang, atau Samping yang mencantumkan tinggi bangunan dan material eksterior.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "ars-potongan",
    category: "arsitektur",
    title: "Gambar Potongan Membujur & Melintang",
    description: "Gambar potongan struktur arsitektural yang memperlihatkan fondasi, lantai, dinding, tinggi plafon, dan atap.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "ars-spesifikasi",
    category: "arsitektur",
    title: "Spesifikasi Teknis Arsitektur (RKS)",
    description: "Uraian jenis material finishing lantai, dinding, kusen, pintu, jendela, dan atap.",
    required: true,
    checked: false,
  });

  // 3. DOKUMEN STRUKTUR
  checklist.push({
    id: "str-pondasi",
    category: "struktur",
    title: "Gambar Rencana & Detail Pondasi",
    description: "Gambar rencana peletakan pondasi beserta detail penampang, dimensi, dan pembesian pondasi.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "str-pembalokan",
    category: "struktur",
    title: "Gambar Rencana Kolom, Balok & Plat",
    description: "Gambar penampang dan pembalokan lantai untuk setiap tingkat.",
    required: true,
    checked: false,
  });

  const perluPerhitunganStruktur = jumlahLantai > 1 || kompleksitas !== Kompleksitas.SEDERHANA || luasBangunan >= 200;
  checklist.push({
    id: "str-kalkulasi",
    category: "struktur",
    title: "Dokumen Perhitungan Struktur",
    description: "Analisis perhitungan struktur beton/baja/kayu yang ditandatangani oleh ahli teknik sipil bersertifikat (SKA).",
    required: perluPerhitunganStruktur,
    checked: false,
  });

  checklist.push({
    id: "str-sondir",
    category: "struktur",
    title: "Laporan Penyelidikan Tanah (Sondir)",
    description: "Hasil tes sondir / boring tanah untuk menentukan daya dukung tanah pondasi.",
    required: jumlahLantai >= 2 || luasBangunan >= 300,
    checked: false,
  });

  // 4. DOKUMEN UTILLITAS / MEP
  checklist.push({
    id: "mep-air",
    category: "mep",
    title: "Gambar Jaringan Air Bersih & Kotor",
    description: "Diagram air bersih dari sumber (PDAM/Sumur) dan pembuangan air kotor ke riol kota / Septic Tank.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "mep-septic",
    category: "mep",
    title: "Detail Septic Tank / Biotank & Resapan",
    description: "Gambar detail ukuran septic tank kedap air serta sumur resapannya sesuai SNI.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "mep-listrik",
    category: "mep",
    title: "Gambar Rencana Instalasi Listrik",
    description: "Rencana tata letak titik lampu, saklar, stop kontak, sekring pembagi (panel/MCB), dan grounding.",
    required: true,
    checked: false,
  });

  checklist.push({
    id: "mep-drainase",
    category: "mep",
    title: "Rencana Saluran Air Hujan & Sumur Resapan",
    description: "Detail penampungan air hujan agar tidak dibuang langsung ke jalan tetangga.",
    required: true,
    checked: false,
  });

  // Tambahan Utilitas Khusus
  const perluProteksiKebakaran = fungsi === FungsiBangunan.USAHA || luasBangunan >= 250;
  checklist.push({
    id: "mep-apar",
    category: "mep",
    title: "Rencana Proteksi Kebakaran (APAR / Hydrant)",
    description: "Penempatan Alat Pemadam Api Ringan (APAR) atau hydrant untuk mitigasi kebakaran dini.",
    required: perluProteksiKebakaran,
    checked: false,
  });

  // 5. DOKUMEN LINGKUNGAN (USAHA / NON-HUNIAN)
  const perluDampakLingkungan = fungsi === FungsiBangunan.USAHA || fungsi === FungsiBangunan.KHUSUS;
  checklist.push({
    id: "env-dokumen",
    category: "lingkungan",
    title: "Dokumen Lingkungan (SPPL / UKL-UPL)",
    description: "Surat Pernyataan Kesanggupan Pengelolaan Lingkungan (SPPL) atau dokumen AMDAL/UKL-UPL untuk fungsi usaha/sosial.",
    required: perluDampakLingkungan,
    checked: false,
  });

  return checklist;
}

export function calculateRetribusiPBG(params: {
  luasBangunan: number;
  jumlahLantai: number;
  fungsiBangunan: FungsiBangunan;
  kompleksitas: Kompleksitas;
  permanen: boolean;
}): RetribusiCalculation {
  const { luasBangunan, jumlahLantai, fungsiBangunan, kompleksitas, permanen } = params;

  // 1. Indeks Fungsi
  let indeksFungsi = 0.15; // default
  if (fungsiBangunan === FungsiBangunan.HUNIAN) {
    indeksFungsi = kompleksitas === Kompleksitas.SEDERHANA ? 0.10 : 0.15;
  } else if (fungsiBangunan === FungsiBangunan.USAHA) {
    indeksFungsi = 0.35;
  } else if (fungsiBangunan === FungsiBangunan.KEAGAMAAN) {
    indeksFungsi = 0.00; // Keagamaan biasanya gratis retribusi sesuai regulasi nasional
  } else if (fungsiBangunan === FungsiBangunan.SOSIAL_BUDAYA) {
    indeksFungsi = 0.10;
  } else if (fungsiBangunan === FungsiBangunan.KHUSUS) {
    indeksFungsi = 0.50;
  } else if (fungsiBangunan === FungsiBangunan.CAMPURAN) {
    indeksFungsi = 0.40;
  }

  // 2. Indeks Klasifikasi
  // Gabungan Kompleksitas + Permanensi + Ketinggian Lantai
  let faktorKompleksitas = 1.0;
  if (kompleksitas === Kompleksitas.SEDERHANA) faktorKompleksitas = 1.0;
  else if (kompleksitas === Kompleksitas.TIDAK_SEDERHANA) faktorKompleksitas = 1.5;
  else if (kompleksitas === Kompleksitas.KHUSUS) faktorKompleksitas = 2.0;

  let faktorKetinggian = 1.0;
  if (jumlahLantai === 1) faktorKetinggian = 1.0;
  else if (jumlahLantai === 2) faktorKetinggian = 1.08;
  else if (jumlahLantai <= 4) faktorKetinggian = 1.15;
  else faktorKetinggian = 1.30;

  const tingkatPermanensi = permanen ? "permanen" : "semi_permanen";
  const faktorPermanensi = permanen ? 1.0 : 0.75;

  // Indeks Klasifikasi Terintegrasi
  const indeksKlasifikasi = Number((faktorKompleksitas * faktorKetinggian * faktorPermanensi).toFixed(3));

  // 3. Tarif Dasar standard (KemenPUPR)
  const tarifDasar = 25000; // Rp 25.000 / m2

  const indeksWaktu = 1.0; // Standar penggunaan terus-menerus

  // Formula Retribusi: Luas x (Indeks Fungsi * Indeks Klasifikasi * Indeks Waktu) * Tarif Dasar
  const totalRetribusi = Math.round(
    luasBangunan * indeksFungsi * indeksKlasifikasi * indeksWaktu * tarifDasar
  );

  return {
    luasBangunan,
    jumlahLantai,
    tingkatPermanensi,
    indeksFungsi,
    indeksKlasifikasi,
    indeksWaktu,
    tarifDasar,
    totalRetribusi,
  };
}
