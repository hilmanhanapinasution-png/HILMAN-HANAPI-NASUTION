import React, { useState, useRef, useEffect } from "react";
import { ProjectDraft, ChatMessage } from "../types";
import { Bot, User, Sparkles, Loader2, RefreshCw, Send } from "lucide-react";

interface ChatPanelProps {
  project: ProjectDraft | null;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  isSending: boolean;
}

const FAQ_STARTERS = [
  "Bagaimana alur pendaftaran PBG di simbg.pu.go.id?",
  "Apa saja syarat teknis arsitektur untuk rumah 2 lantai?",
  "Kapan berkas struktur wajib dilampirkan hasil sondir tanah?",
  "Bagaimana cara mengurus SLF setelah pembangunan selesai?",
];

export default function ChatPanel({
  project,
  chatHistory,
  onSendMessage,
  onClearChat,
  isSending,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleChipClick = (starter: string) => {
    if (isSending) return;
    onSendMessage(starter);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" id="chat-panel-container">
      {/* Clinic Chat Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0" id="chat-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm sm:text-base">Asisten Pakar PBG & SLF</h3>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Klinik Konsultasi Teknis & Regulasi SIMBG</p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          title="Reset Sesi Konsultasi"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Active Project Banner */}
      {project && (
        <div className="bg-blue-50/70 border-b border-blue-100/50 px-4 py-2.5 flex items-center justify-between text-xs text-blue-950 shrink-0" id="active-project-banner">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium">
              Konsultasi Anda terhubung dengan proyek: <strong className="font-bold">{project.name}</strong>
            </span>
          </div>
          <div className="text-[10px] text-blue-500 font-bold bg-blue-100/50 px-2 py-0.5 rounded-full">
            {project.fungsiBangunan} • {project.luasBangunan} m²
          </div>
        </div>
      )}

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" id="chat-messages-scroll">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto py-8 space-y-6" id="chat-intro">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-base">Selamat Datang di Klinik AI PBG!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tanyakan apa saja seputar persyaratan teknis arsitektur, kalkulasi struktur beton/baja, 
                instalasi utilitas (MEP), atau tatacara pengajuan akun serta dokumen di portal SIMBG.
              </p>
            </div>

            {/* Starter chips */}
            <div className="w-full space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Pertanyaan Populer Warga:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="faq-chips">
                {FAQ_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(starter)}
                    className="p-3 text-left bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-[11px] text-slate-700 font-bold rounded-lg transition-all shadow-sm"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4" id="messages-list">
            {chatHistory.map((msg) => {
              const isAI = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                    isAI ? "bg-blue-600 text-white animate-fade-in" : "bg-slate-300 text-slate-700"
                  }`}>
                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble wrapper */}
                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAI
                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                        : "bg-blue-600 text-white rounded-tr-none"
                    }`}>
                      {/* Message Content Rendered as simple paragraph groups to prevent react-markdown complexity */}
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.content}
                      </div>
                    </div>
                    <span className="block text-[9px] text-slate-400 font-semibold px-1">
                      {isAI ? "Klinik AI Expert" : "Anda"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3 mr-auto max-w-xl" id="chat-loading-indicator">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-none text-xs flex items-center gap-2 shadow-sm">
                  <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                  Asisten sedang menganalisis regulasi & merumuskan jawaban...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0" id="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isSending ? "Tunggu asisten menjawab..." : "Tulis pertanyaan Anda seputar PBG/SLF..."}
          disabled={isSending}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-xl px-4 py-3 text-xs sm:text-sm font-medium transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-5 py-3 rounded-xl transition-all flex items-center justify-center shrink-0 font-bold shadow-md shadow-blue-600/15"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
