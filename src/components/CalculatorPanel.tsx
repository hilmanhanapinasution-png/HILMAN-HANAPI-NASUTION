import React from "react";
import { ProjectDraft, FungsiBangunan, Kompleksitas } from "../types";
import { Calculator, Info } from "lucide-react";
import { calculateRetribusiPBG } from "../utils/pbgHelper";

interface CalculatorPanelProps {
  project: ProjectDraft | null;
  onUpdateRetribution: (retribution: ReturnType<typeof calculateRetribusiPBG>) => void;
  onModifyProjectSettings: (updates: Partial<ProjectDraft>) => void;
}

export default function CalculatorPanel({
  project,
  onUpdateRetribution,
  onModifyProjectSettings,
}: CalculatorPanelProps) {
  if (!project) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm" id="calculator-empty">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Tidak ada Proyek yang Dipilih</h3>
        <p className="text-xs text-slate-500">
          Buat atau pilih proyek dari dashboard untuk mensimulasikan rincian biaya retribusi PBG.
        </p>
      </div>
    );
  }

  const {
    luasBangunan,
    jumlahLantai,
    fungsiBangunan,
    kompleksitas,
    permanen,
    retribusi,
  } = project;

  // Handle live calculation inputs changes
  const updateCalculation = (updates: Partial<ProjectDraft>) => {
    // Merge updates with current project
    const updatedLuas = updates.luasBangunan !== undefined ? updates.luasBangunan : luasBangunan;
    const updatedLantai = updates.jumlahLantai !== undefined ? updates.jumlahLantai : jumlahLantai;
    const updatedFungsi = updates.fungsiBangunan !== undefined ? updates.fungsiBangunan : fungsiBangunan;
    const updatedKompleksitas = updates.kompleksitas !== undefined ? updates.kompleksitas : kompleksitas;
    const updatedPermanen = updates.permanen !== undefined ? updates.permanen : permanen;

    const newRetribution = calculateRetribusiPBG({
      luasBangunan: updatedLuas,
      jumlahLantai: updatedLantai,
      fungsiBangunan: updatedFungsi,
      kompleksitas: updatedKompleksitas,
      permanen: updatedPermanen,
    });

    onModifyProjectSettings({
      ...updates,
      retribusi: newRetribution,
    });
  };

  return (
    <div className="space-y-6" id="calculator-panel-container">
      {/* Header with Professional Polish Style */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Proyek Aktif: {project.name}</span>
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mt-1 uppercase tracking-wide">
          <Calculator className="w-5 h-5 text-blue-600" /> Kalkulator Estimasi Retribusi PBG
        </h2>
        <p className="text-xs text-slate-500">
          Simulasikan retribusi pengajuan berdasarkan Peraturan Pemerintah Nomor 16 Tahun 2021
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="calculator-grid">
        {/* Input Parameters panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm" id="calculator-inputs">
          <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-widest">
            ⚙️ Parameter Bangunan
          </h3>

          {/* Luas Bangunan */}
          <div className="space-y-1.5" id="input-luas">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Luas Bangunan (m²)</span>
              <span className="text-blue-600 font-extrabold">{luasBangunan} m²</span>
            </label>
            <input
              type="number"
              min="1"
              value={luasBangunan}
              onChange={(e) => updateCalculation({ luasBangunan: Math.max(1, Number(e.target.value)) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Jumlah Lantai */}
          <div className="space-y-1.5" id="input-lantai">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Jumlah Lantai</span>
              <span className="text-blue-600 font-extrabold">{jumlahLantai} Lantai</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={jumlahLantai}
              onChange={(e) => updateCalculation({ jumlahLantai: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
              <span>1 Lantai</span>
              <span>10 Lantai</span>
              <span>20 Lantai</span>
            </div>
          </div>

          {/* Fungsi Bangunan */}
          <div className="space-y-1.5" id="input-fungsi">
            <label className="text-xs font-bold text-slate-700">Fungsi Utama Bangunan</label>
            <select
              value={fungsiBangunan}
              onChange={(e) => updateCalculation({ fungsiBangunan: e.target.value as FungsiBangunan })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700"
            >
              <option value={FungsiBangunan.HUNIAN}>Rumah Tinggal / Hunian (Indeks 0.10 - 0.15)</option>
              <option value={FungsiBangunan.USAHA}>Komersial / Ruko / Kantor / Usaha (Indeks 0.35)</option>
              <option value={FungsiBangunan.SOSIAL_BUDAYA}>Sosial, Pendidikan & Budaya (Indeks 0.10)</option>
              <option value={FungsiBangunan.KEAGAMAAN}>Tempat Ibadah / Keagamaan (Indeks 0.00 / Bebas Retribusi)</option>
              <option value={FungsiBangunan.KHUSUS}>Khusus / Industri / Pabrik (Indeks 0.50)</option>
            </select>
          </div>

          {/* Kompleksitas */}
          <div className="space-y-1.5" id="input-kompleksitas">
            <label className="text-xs font-bold text-slate-700">Kompleksitas Bangunan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateCalculation({ kompleksitas: Kompleksitas.SEDERHANA })}
                className={`py-2.5 px-3 border rounded-lg text-xs font-bold transition-all ${
                  kompleksitas === Kompleksitas.SEDERHANA
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                Sederhana
              </button>
              <button
                type="button"
                onClick={() => updateCalculation({ kompleksitas: Kompleksitas.TIDAK_SEDERHANA })}
                className={`py-2.5 px-3 border rounded-lg text-xs font-bold transition-all ${
                  kompleksitas === Kompleksitas.TIDAK_SEDERHANA
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                Tidak Sederhana
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              * Sederhana: Rumah tinggal ≤ 2 lantai, bentang struktur standar. <br />
              * Tidak Sederhana: Rumah tinggal &gt; 2 lantai, bangunan umum, bentang lebar.
            </p>
          </div>

          {/* Permanensi */}
          <div className="space-y-1.5" id="input-permanen">
            <label className="text-xs font-bold text-slate-700">Jenis Konstruksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateCalculation({ permanen: true })}
                className={`py-2.5 px-3 border rounded-lg text-xs font-bold transition-all ${
                  permanen
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                Permanen (Beton/Baja)
              </button>
              <button
                type="button"
                onClick={() => updateCalculation({ permanen: false })}
                className={`py-2.5 px-3 border rounded-lg text-xs font-bold transition-all ${
                  !permanen
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                Semi-Permanen (Kayu)
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Output Panel */}
        <div className="lg:col-span-7 space-y-6" id="calculator-output">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/30">
                Est. Nilai Retribusi PBG
              </span>

              <div className="space-y-1">
                <span className="block text-[11px] text-slate-300">Estimasi Total Kewajiban</span>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight" id="estimated-total">
                  Rp {retribusi.totalRetribusi.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Formula step display */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-3" id="formula-breakdown">
              <span className="block text-xs font-bold text-blue-300 uppercase tracking-wider">🔬 Rumus Penghitungan</span>
              
              <div className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-lg overflow-x-auto border border-slate-800">
                Retribusi = Luas ({luasBangunan} m²) × Indeks Fungsi ({retribusi.indeksFungsi}) × Indeks Klasifikasi ({retribusi.indeksKlasifikasi}) × Tarif Dasar (Rp {retribusi.tarifDasar.toLocaleString()})
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 text-slate-300" id="indeks-elements">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Indeks Fungsi</span>
                  <span className="font-extrabold text-white text-sm">{retribusi.indeksFungsi}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Nilai pengali peruntukan bangunan</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Indeks Klasifikasi</span>
                  <span className="font-extrabold text-white text-sm">{retribusi.indeksKlasifikasi}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Kompleksitas × Lantai × Permanensi</p>
                </div>
              </div>
            </div>

            {/* Regulatory compliance callout */}
            <div className="text-xs text-slate-400 leading-relaxed flex gap-2" id="regulatory-callout">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300 block mb-0.5">Regulasi PP Nomor 16 Tahun 2021:</span>
                Estimasi ini dihitung secara transparan berbasis indeks teknis PUPR. Pemerintah Kabupaten/Kota menerbitkan ketetapan resmi (SKRD) menggunakan tarif dasar perda setempat. Rumah ibadah dibebaskan 100% dari biaya retribusi PBG.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
