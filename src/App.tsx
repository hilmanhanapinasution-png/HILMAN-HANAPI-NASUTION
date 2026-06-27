import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ProjectDraft, ChatMessage, FungsiBangunan, Kompleksitas } from "./types";
import { generateDefaultChecklist, calculateRetribusiPBG } from "./utils/pbgHelper";

import Dashboard from "./components/Dashboard";
import ChecklistPanel from "./components/ChecklistPanel";
import CalculatorPanel from "./components/CalculatorPanel";
import ChatPanel from "./components/ChatPanel";
import ProjectModal from "./components/ProjectModal";

import { 
  Building, 
  FileText, 
  Calculator, 
  MessageSquare, 
  LayoutDashboard, 
  FolderOpen,
  MapPin,
  Sparkles,
  HelpCircle,
  CheckSquare
} from "lucide-react";

export default function App() {
  const [projects, setProjects] = useState<ProjectDraft[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist" | "calculator" | "chat">("dashboard");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load projects from Firestore on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const list: ProjectDraft[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ProjectDraft);
        });

        if (list.length > 0) {
          setProjects(list);
          setActiveProjectId(list[0].id);
        } else {
          // If Firestore is empty, load from LocalStorage or seed one
          const localData = localStorage.getItem("pbg_projects");
          if (localData) {
            const parsed = JSON.parse(localData);
            setProjects(parsed);
            if (parsed.length > 0) {
              setActiveProjectId(parsed[0].id);
            }
          } else {
            // Seed a default project to make the app friendly out-of-the-box
            const defaultProj: ProjectDraft = {
              id: "proyek-seed-1",
              name: "Rumah Tinggal Standard 2 Lantai",
              address: "Jl. Pemuda No. 45, Surabaya",
              fungsiBangunan: FungsiBangunan.HUNIAN,
              subFungsi: "Rumah Tinggal Tunggal Sederhana",
              kompleksitas: Kompleksitas.SEDERHANA,
              jumlahLantai: 2,
              luasBangunan: 120,
              permanen: true,
              checklist: generateDefaultChecklist(FungsiBangunan.HUNIAN, Kompleksitas.SEDERHANA, 2, 120),
              retribusi: calculateRetribusiPBG({
                luasBangunan: 120,
                jumlahLantai: 2,
                fungsiBangunan: FungsiBangunan.HUNIAN,
                kompleksitas: Kompleksitas.SEDERHANA,
                permanen: true,
              }),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setProjects([defaultProj]);
            setActiveProjectId(defaultProj.id);
            localStorage.setItem("pbg_projects", JSON.stringify([defaultProj]));
            
            // Try saving to firestore in background
            addDoc(collection(db, "projects"), defaultProj).catch(err => {
              console.warn("Firestore offline/write failed:", err);
            });
          }
        }
      } catch (error) {
        console.error("Error loading projects from Firestore:", error);
        // Fallback to local storage
        const localData = localStorage.getItem("pbg_projects");
        if (localData) {
          const parsed = JSON.parse(localData);
          setProjects(parsed);
          if (parsed.length > 0) {
            setActiveProjectId(parsed[0].id);
          }
        }
      }
    };

    fetchProjects();
  }, []);

  // Save projects to localStorage whenever projects state changes
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("pbg_projects", JSON.stringify(projects));
    }
  }, [projects]);

  // Load chat history for selected project
  useEffect(() => {
    if (activeProjectId) {
      const savedChat = localStorage.getItem(`pbg_chat_${activeProjectId}`);
      if (savedChat) {
        setChatHistory(JSON.parse(savedChat));
      } else {
        setChatHistory([]);
      }
    } else {
      setChatHistory([]);
    }
  }, [activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Handle Project Selection
  const handleSelectProject = (project: ProjectDraft) => {
    setActiveProjectId(project.id);
  };

  // Handle Project Creation from Modal
  const handleCreateProject = async (
    newProjectData: Omit<ProjectDraft, "id" | "createdAt" | "updatedAt">
  ) => {
    const newId = `proj_${Date.now()}`;
    const newProject: ProjectDraft = {
      ...newProjectData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setActiveProjectId(newId);
    setIsNewProjectModalOpen(false);

    // Save to Firestore
    try {
      await setDoc(doc(db, "projects", newId), newProject);
    } catch (error) {
      console.warn("Could not save new project to Firestore, saved locally:", error);
    }
  };

  // Handle updates to the checklist
  const handleUpdateChecklist = async (updatedChecklist: typeof activeProject.checklist) => {
    if (!activeProjectId || !activeProject) return;

    const updatedProject = {
      ...activeProject,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? updatedProject : p
    );
    setProjects(updatedProjects);

    // Update in Firestore
    try {
      await updateDoc(doc(db, "projects", activeProjectId), {
        checklist: updatedChecklist,
        updatedAt: updatedProject.updatedAt,
      });
    } catch (error) {
      console.warn("Firestore update failed, saved locally:", error);
    }
  };

  // Handle project settings changes (luas, lantai, function, permanen)
  const handleModifyProjectSettings = async (updates: Partial<ProjectDraft>) => {
    if (!activeProjectId || !activeProject) return;

    const updatedProject = {
      ...activeProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? updatedProject : p
    );
    setProjects(updatedProjects);

    // Update in Firestore
    try {
      await updateDoc(doc(db, "projects", activeProjectId), {
        ...updates,
        updatedAt: updatedProject.updatedAt,
      });
    } catch (error) {
      console.warn("Firestore update settings failed, saved locally:", error);
    }
  };

  // Handle sending a message to Gemini API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const newUserMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    localStorage.setItem(`pbg_chat_${activeProjectId}`, JSON.stringify(updatedHistory));

    setIsSending(true);

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedHistory,
          projectDetails: activeProject ? {
            name: activeProject.name,
            fungsiBangunan: activeProject.fungsiBangunan,
            subFungsi: activeProject.subFungsi,
            kompleksitas: activeProject.kompleksitas,
            jumlahLantai: activeProject.jumlahLantai,
            luasBangunan: activeProject.luasBangunan,
            permanen: activeProject.permanen,
            retribusi: activeProject.retribusi,
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menerima respon dari server konsultasi.");
      }

      const data = await response.json();

      const newAIMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: "model",
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      const finalHistory = [...updatedHistory, newAIMessage];
      setChatHistory(finalHistory);
      localStorage.setItem(`pbg_chat_${activeProjectId}`, JSON.stringify(finalHistory));

      // Optional: Store chat in firestore under projects or consultations
      if (activeProjectId) {
        updateDoc(doc(db, "projects", activeProjectId), {
          lastConsultationAt: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (error: any) {
      console.error("AI chat communication error:", error);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        content: `⚠️ Maaf, asisten kami sedang mengalami gangguan koneksi ke server pusat. Silakan cek koneksi internet Anda atau coba sesaat lagi.\n\nDetail Error: ${error.message || error}`,
        timestamp: new Date().toISOString(),
      };
      const finalHistory = [...updatedHistory, errorMessage];
      setChatHistory(finalHistory);
    } finally {
      setIsSending(false);
    }
  };

  // Clear chat logs
  const handleClearChat = () => {
    if (activeProjectId) {
      localStorage.removeItem(`pbg_chat_${activeProjectId}`);
      setChatHistory([]);
    }
  };

  // Stats calculation for the Professional Polish Sub-Header
  const totalProjects = projects.length;
  const pendingReview = projects.filter(
    (p) => p.checklist.some((c) => c.required && !c.checked)
  ).length;
  const completedProjects = projects.filter(
    (p) => p.checklist.every((c) => !c.required || c.checked)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600" id="main-app-layout">
      {/* Upper Navigation / Bar in Slate-900 with Professional Polish Style */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 text-white shadow-lg shrink-0 h-16" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl italic text-white shadow-md shadow-blue-600/20">
              K
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-none uppercase">
                Klinik PBG Mandiri
              </h1>
              <p className="text-[10px] text-slate-400">Persetujuan Bangunan Gedung Independen</p>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="flex items-center space-x-1 sm:space-x-2" id="tab-nav">
            <button
              onClick={() => setActiveTab("dashboard")}
              id="tab-btn-dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              id="tab-btn-checklist"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "checklist"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cek Berkas</span>
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              id="tab-btn-calculator"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "calculator"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kalkulator Retribusi</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              id="tab-btn-chat"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Konsultasi AI</span>
            </button>
          </nav>

          {/* User profile info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-100">Bapak Hilman H.</p>
              <p className="text-[10px] text-slate-400 italic">Pemilik Proyek Mandiri</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-blue-400">
              HH
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header / Real-Time Live Stats in Professional Polish Style */}
      <div className="bg-white border-b border-slate-200" id="sub-header-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Total Draf Proyek</span>
              <span className="text-xl font-black text-slate-800">{totalProjects}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Lengkapi Berkas</span>
              <span className="text-xl font-black text-orange-500">{pendingReview}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Berkas Layak SIMBG</span>
              <span className="text-xl font-black text-emerald-600">{completedProjects}</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>+ Buat Konsultasi Baru</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-main">
        {/* If an active project exists, show a subtle quick info status bar above */}
        {activeProject && activeTab !== "dashboard" && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 mb-6" id="active-project-bar">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="text-xs font-bold text-slate-700">Proyek Aktif: {activeProject.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">({activeProject.fungsiBangunan} • {activeProject.luasBangunan} m²)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Ganti Proyek
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Panel rendering */}
        <div id="tab-view-container">
          {activeTab === "dashboard" && (
            <Dashboard
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onCreateProject={() => setIsNewProjectModalOpen(true)}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === "checklist" && (
            <ChecklistPanel
              project={activeProject}
              onUpdateChecklist={handleUpdateChecklist}
            />
          )}

          {activeTab === "calculator" && (
            <CalculatorPanel
              project={activeProject}
              onUpdateRetribution={(retrib) => handleModifyProjectSettings({ retribusi: retrib })}
              onModifyProjectSettings={handleModifyProjectSettings}
            />
          )}

          {activeTab === "chat" && (
            <ChatPanel
              project={activeProject}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isSending={isSending}
            />
          )}
        </div>
      </main>

      {/* Modern Humble Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Klinik Konsultasi PBG Mandiri. PP No 16/2021.</p>
          <div className="flex items-center gap-4">
            <a href="https://simbg.pu.go.id" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">Portal SIMBG Resmi</a>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            <span>Didukung Asisten AI Terintegrasi</span>
          </div>
        </div>
      </footer>

      {/* Create New Project Modal */}
      {isNewProjectModalOpen && (
        <ProjectModal
          onClose={() => setIsNewProjectModalOpen(false)}
          onSave={handleCreateProject}
        />
      )}
    </div>
  );
}
