import React, { useState } from "react";
import { FungsiBangunan, Kompleksitas, ProjectDraft } from "../types";
import { X, Building, MapPin, Layers, Maximize } from "lucide-react";
import { generateDefaultChecklist, calculateRetribusiPBG } from "../utils/pbgHelper";

interface ProjectModalProps {
  onClose: () => void;
  onSave: (projectData: Omit<ProjectDraft, "id" | "createdAt" | "updatedAt">) => void;
}

export default function ProjectModal({ onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fungsi, setFungsi] = useState<FungsiBangunan>(FungsiBangunan.HUNIAN);
  const [subFungsi, setSubFungsi] = useState("");
  const [kompleksitas, setKompleksitas] = useState<Kompleksitas>(Kompleksitas.SEDERHANA);
  const [jumlahLantai, setJumlahLantai] = useState<number>(1);
  const [luasBangunan, setLuasBangunan] = useState<number>(100);
  const [permanen, setPermanen] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate defaults
    const defaultChecklist = generateDefaultChecklist(fungsi, kompleksitas, jumlahLantai, luasBangunan);
    const initialRetribusi = calculateRetribusiPBG({
      luasBangunan,
      jumlahLantai,
      fungsiBangunan: fungsi,
      kompleksitas,
      permanen,
    });

    onSave({
      name: name.trim(),
      address: address.trim() || "Tidak ditentukan",
      fungsiBangunan: fungsi,
      subFungsi: subFungsi.trim() || "Umum/Standar",
      kompleksitas,
      jumlahLantai,
      luasBangunan,
      permanen,
      checklist: defaultChecklist,
      retribusi: initialRetribusi,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="project-modal-backdrop">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" id="project-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base uppercase tracking-wide">Buat Proyek Konsultasi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1" id="form-name">
            <label className="text-xs font-bold text-slate-700 block">Nama Proyek / Bangunan *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Rumah Tinggal Pak Hilman"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-3 py-2 text-xs sm:text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1" id="form-address">
            <label className="text-xs font-bold text-slate-700 block">Lokasi / Alamat Rencana Pembangunan</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="cth: Jl. Dahlia No. 4, Kecamatan Pancoran"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Fungsi & Sub-Fungsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1" id="form-fungsi">
              <label className="text-xs font-bold text-slate-700 block">Fungsi Utama</label>
              <select
                value={fungsi}
                onChange={(e) => setFungsi(e.target.value as FungsiBangunan)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700"
              >
                <option value={FungsiBangunan.HUNIAN}>Rumah Tinggal</option>
                <option value={FungsiBangunan.USAHA}>Komersial / Usaha</option>
                <option value={FungsiBangunan.SOSIAL_BUDAYA}>Sosial Budaya</option>
                <option value={FungsiBangunan.KEAGAMAAN}>Tempat Ibadah</option>
                <option value={FungsiBangunan.KHUSUS}>Khusus / Industri</option>
              </select>
            </div>

            <div className="space-y-1" id="form-subfungsi">
              <label className="text-xs font-bold text-slate-700 block">Sub-Fungsi / Jenis Detail</label>
              <input
                type="text"
                value={subFungsi}
                onChange={(e) => setSubFungsi(e.target.value)}
                placeholder="cth: Rumah Tinggal Tunggal"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Luas & Jumlah Lantai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1" id="form-luas">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-blue-600" /> Luas Bangunan Utama (m²)
              </label>
              <input
                type="number"
                min="1"
                required
                value={luasBangunan}
                onChange={(e) => setLuasBangunan(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1" id="form-lantai">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Jumlah Lantai Bangunan
              </label>
              <input
                type="number"
                min="1"
                required
                value={jumlahLantai}
                onChange={(e) => setJumlahLantai(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Kompleksitas & Permanensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1" id="form-kompleksitas">
              <label className="text-xs font-bold text-slate-700 block">Klasifikasi Kompleksitas</label>
              <select
                value={kompleksitas}
                onChange={(e) => setKompleksitas(e.target.value as Kompleksitas)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700"
              >
                <option value={Kompleksitas.SEDERHANA}>Sederhana (Rumah Tinggal Biasa)</option>
                <option value={Kompleksitas.TIDAK_SEDERHANA}>Tidak Sederhana (Bentang Lebar)</option>
              </select>
            </div>

            <div className="space-y-1" id="form-permanensi">
              <label className="text-xs font-bold text-slate-700 block">Sifat Konstruksi</label>
              <select
                value={permanen ? "true" : "false"}
                onChange={(e) => setPermanen(e.target.value === "true")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700"
              >
                <option value="true">Permanen (Struktur Beton/Baja)</option>
                <option value="false">Semi-Permanen (Kayu)</option>
              </select>
            </div>
          </div>

          {/* Alert Info */}
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-[11px] text-slate-700 leading-relaxed" id="form-disclaimer">
            💡 <strong>Rekomendasi Dokumen:</strong> Sistem akan otomatis memetakan daftar kelengkapan 
            surat administratif serta format gambar teknis arsitektur, struktur, dan utilitas yang sesuai dengan kriteria yang Anda input di atas.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/10 transition-colors"
            >
              Buat & Analisis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
