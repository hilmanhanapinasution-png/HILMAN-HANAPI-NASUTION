export enum FungsiBangunan {
  HUNIAN = "Hunian",
  USAHA = "Usaha",
  KEAGAMAAN = "Keagamaan",
  SOSIAL_BUDAYA = "Sosial Budaya",
  KHUSUS = "Khusus",
  CAMPURAN = "Campuran",
}

export enum Kompleksitas {
  SEDERHANA = "Sederhana",
  TIDAK_SEDERHANA = "Tidak Sederhana",
  KHUSUS = "Khusus",
}

export enum KlasifikasiKetinggian {
  RENDAH = "Rendah (1-4 Lantai)",
  SEDANG = "Sedang (5-8 Lantai)",
  TINGGI = "Tinggi (>8 Lantai)",
}

export interface ChecklistItem {
  id: string;
  category: "administratif" | "arsitektur" | "struktur" | "mep" | "lingkungan";
  title: string;
  description: string;
  required: boolean;
  checked: boolean;
  notes?: string;
}

export interface RetribusiCalculation {
  luasBangunan: number;
  jumlahLantai: number;
  tingkatPermanensi: "permanen" | "semi_permanen" | "darurat";
  indeksFungsi: number;
  indeksKlasifikasi: number;
  indeksWaktu: number; // Biasanya 1.0
  tarifDasar: number; // Standard: e.g., Rp 20.000 / m2
  totalRetribusi: number;
}

export interface ProjectDraft {
  id: string;
  name: string;
  ownerEmail?: string;
  address: string;
  fungsiBangunan: FungsiBangunan;
  subFungsi: string;
  kompleksitas: Kompleksitas;
  jumlahLantai: number;
  luasBangunan: number;
  permanen: boolean;
  checklist: ChecklistItem[];
  retribusi: RetribusiCalculation;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ConsultationSession {
  id: string;
  projectId?: string; // Optional reference to a draft project
  projectName?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
