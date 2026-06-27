import React from "react";
import { ProjectDraft } from "../types";
import { FileText, Calculator, MessageSquare, Plus, CheckCircle2, HelpCircle, Landmark } from "lucide-react";

interface DashboardProps {
  projects: ProjectDraft[];
  activeProject: ProjectDraft | null;
  onSelectProject: (project: ProjectDraft) => void;
  onCreateProject: () => void;
  onSwitchTab: (tab: "checklist" | "calculator" | "chat") => void;
}

export default function Dashboard({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onSwitchTab,
}: DashboardProps) {
  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Welcome Banner with Professional Polish Look */}
      <div 
        id="welcome-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 text-white shadow-xl border border-slate-700/50"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4">
            <Landmark className="w-3.5 h-3.5" /> Portal Konsultasi Mandiri (PP 16/2021)
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl mb-3 text-white">
            Klinik PBG & SLF Mandiri
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Periksa kelayakan persyaratan teknis bangunan Anda, simulasikan perhitungan retribusi, 
            dan konsultasikan rencana arsitektur & struktur langsung dengan asisten pakar AI kami sebelum mengajukan ke SIMBG.
          </p>
        </div>
      </div>

      {/* Grid: Active Project Status & SIMBG Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-grid">
        {/* Left Column: Projects Management */}
        <div className="lg:col-span-7 space-y-6" id="projects-section">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                📂 Proyek Konsultasi Anda
              </h2>
              <p className="text-xs text-slate-500">Pilih proyek aktif untuk melakukan simulasi detail</p>
            </div>
            <button
              id="btn-new-project"
              onClick={onCreateProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Proyek Baru
            </button>
          </div>

          {projects.length === 0 ? (
            <div 
              id="empty-projects"
              className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 rounded-2xl bg-white text-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Belum ada Proyek Konsultasi</h3>
              <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                Buat analisis draf proyek bangunan pertama Anda untuk memeriksa berkas kelengkapan administrasi dan teknis yang diperlukan.
              </p>
              <button
                id="btn-create-first"
                onClick={onCreateProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Mulai Draf Proyek Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4" id="projects-list">
              {projects.map((proj) => {
                const checkedCount = proj.checklist.filter((c) => c.checked).length;
                const totalCount = proj.checklist.length;
                const progressPercentage = Math.round((checkedCount / totalCount) * 100) || 0;
                const isActive = activeProject?.id === proj.id;

                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    id={`project-card-${proj.id}`}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600/30 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {proj.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase bg-blue-600 text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {proj.fungsiBangunan} • {proj.jumlahLantai} Lantai • {proj.luasBangunan} m²
                        </p>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        Rp {proj.retribusi.totalRetribusi.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Kesiapan Berkas: {checkedCount}/{totalCount} Dokumen</span>
                        <span className="font-bold text-blue-600">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Access Actions (only if active) */}
                    {isActive && (
                      <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-3 gap-2" id="quick-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchTab("checklist");
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> Berkas
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchTab("calculator");
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-sm"
                        >
                          <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Retribusi
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchTab("chat");
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-blue-600/10"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-white" /> Tanya AI
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: SIMBG Submission Workflow */}
        <div className="lg:col-span-5 space-y-6" id="simbg-guide-section">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <HelpCircle className="w-5 h-5 text-blue-600" /> Alur Pengurusan PBG & SLF
              </h2>
              <p className="text-xs text-slate-500">SOP Resmi Sistem Informasi Manajemen Bangunan Gedung (SIMBG)</p>
            </div>

            <div className="space-y-5 relative pl-4 border-l border-slate-100" id="steps-container">
              {/* Step 1 */}
              <div className="relative" id="step-1">
                <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center"></div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tahap 1: Registrasi Akun</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Daftarkan diri Anda sebagai <strong>Pemohon</strong> di portal resmi <a href="https://simbg.pu.go.id" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">simbg.pu.go.id</a> menggunakan email aktif.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative" id="step-2">
                <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white flex items-center justify-center"></div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tahap 2: Input Data & Upload Berkas</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Masukkan data bangunan (luas, fungsi, jumlah lantai) serta koordinat tanah, lalu unggah dokumen administratif & dokumen teknis lengkap.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative" id="step-3">
                <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white flex items-center justify-center"></div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tahap 3: Verifikasi Dokumen & Sidang TPA</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Petugas Dinas Teknis memverifikasi berkas Anda. Jika non-sederhana, berkas akan disidangkan oleh Tim Profesi Ahli (TPA) / Tim Penilai Teknis (TPT).
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative" id="step-4">
                <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white flex items-center justify-center"></div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tahap 4: Pembayaran Retribusi & Terbit</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Membayar SKRD (Surat Ketetapan Retribusi Daerah) melalui bank penunjuk setelah perhitungan keluar. Dokumen PBG resmi akan langsung diterbitkan secara digital.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3" id="alert-slf">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-950 block mb-0.5">💡 Info Penting SLF:</span>
                Setelah bangunan Anda selesai didirikan sesuai PBG, Anda harus mengajukan <strong>Sertifikat Laik Fungsi (SLF)</strong> agar bangunan dapat beroperasi secara legal dan aman.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
