import React, { useState } from "react";
import { ProjectDraft, ChecklistItem } from "../types";
import { CheckCircle2, Circle, AlertCircle, PenTool, Info } from "lucide-react";

interface ChecklistPanelProps {
  project: ProjectDraft | null;
  onUpdateChecklist: (updatedChecklist: ChecklistItem[]) => void;
}

type CategoryType = "semua" | "administratif" | "arsitektur" | "struktur" | "mep" | "lingkungan";

export default function ChecklistPanel({ project, onUpdateChecklist }: ChecklistPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("semua");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>("");

  if (!project) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm" id="checklist-empty">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Tidak ada Proyek yang Dipilih</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Pilih proyek yang ada dari dashboard atau buat proyek baru untuk dapat memeriksa draf persyaratan berkas pendaftaran PBG Anda.
        </p>
      </div>
    );
  }

  const handleToggleCheck = (itemId: string) => {
    const updated = project.checklist.map((item) => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    onUpdateChecklist(updated);
  };

  const handleSaveNote = (itemId: string) => {
    const updated = project.checklist.map((item) => {
      if (item.id === itemId) {
        return { ...item, notes: tempNoteText };
      }
      return item;
    });
    onUpdateChecklist(updated);
    setEditingNoteId(null);
  };

  const startEditingNote = (item: ChecklistItem) => {
    setEditingNoteId(item.id);
    setTempNoteText(item.notes || "");
  };

  // Filter items
  const categories: { label: string; value: CategoryType }[] = [
    { label: "Semua Dokumen", value: "semua" },
    { label: "Administratif", value: "administratif" },
    { label: "Arsitektur", value: "arsitektur" },
    { label: "Struktur", value: "struktur" },
    { label: "Utilitas / MEP", value: "mep" },
    { label: "Lingkungan", value: "lingkungan" },
  ];

  const filteredItems = project.checklist.filter(
    (item) => activeCategory === "semua" || item.category === activeCategory
  );

  // Group stats
  const totalRequired = project.checklist.filter((c) => c.required).length;
  const totalRequiredChecked = project.checklist.filter((c) => c.required && c.checked).length;
  const isAllRequiredDone = totalRequiredChecked === totalRequired;

  return (
    <div className="space-y-6" id="checklist-panel-container">
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Proyek Aktif: {project.name}</span>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mt-1 uppercase tracking-wide">
            📋 Kendali Mutu Berkas PBG
          </h2>
          <p className="text-xs text-slate-500">Sesuaikan kelengkapan berkas untuk mendaftar di SIMBG</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200" id="checklist-stats">
          <div className="text-center px-4 border-r border-slate-200">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Berkas Wajib</span>
            <span className="text-lg font-extrabold text-slate-800">
              {totalRequiredChecked} <span className="text-xs text-slate-400">/ {totalRequired}</span>
            </span>
          </div>
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Status Kelayakan</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
              isAllRequiredDone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {isAllRequiredDone ? "Layak SIMBG" : "Perlu Lengkapi"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Checklist Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="checklist-grid">
        {/* Categories Sidebar/Selector */}
        <div className="lg:col-span-3 space-y-2" id="checklist-filters">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Kategori Berkas</span>
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count = project.checklist.filter(
                (item) => cat.value === "semua" || item.category === cat.value
              ).length;
              const completedCount = project.checklist.filter(
                (item) => (cat.value === "semua" || item.category === cat.value) && item.checked
              ).length;

              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between shrink-0 lg:shrink-1 border ${
                    activeCategory === cat.value
                      ? "bg-blue-600 text-white shadow-sm border-blue-600"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {completedCount}/{count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 mt-6 hidden lg:block shadow-sm" id="checklist-tip">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-amber-600" /> Tips Konsultasi
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Berkas arsitektur, struktur, dan MEP sangat disarankan untuk digambar menggunakan Software CAD / BIM 
              yang memiliki kop keterangan standar SIMBG agar terhindar dari penolakan berkas oleh Pengawas Daerah.
            </p>
          </div>
        </div>

        {/* Checklist items list */}
        <div className="lg:col-span-9 space-y-3" id="checklist-items-area">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs shadow-sm">
              Tidak ada berkas di kategori ini untuk profil bangunan terpilih.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                id={`checklist-item-card-${item.id}`}
                className={`p-4 bg-white border rounded-xl transition-all ${
                  item.checked ? "border-slate-200 bg-slate-50/40" : "border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleCheck(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                  >
                    {item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.required ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {item.required ? "Wajib" : "Opsional"}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>

                    {/* Notes Area */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {editingNoteId === item.id ? (
                        <div className="flex-1 flex gap-2 w-full">
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Tulis catatan berkas (cth: Sudah digambar arsitek, menunggu ACC)"
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-slate-500 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Catatan:</span>
                            <span className="italic text-slate-600 font-medium">
                              {item.notes || "Belum ada catatan proyek"}
                            </span>
                          </div>
                          <button
                            onClick={() => startEditingNote(item)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 self-start"
                          >
                            <PenTool className="w-3 h-3" /> Edit Catatan
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
