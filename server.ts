import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// Lazy-initialized Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// System Instruction for PBG Clinic Expert
const SYSTEM_INSTRUCTION = `
Anda adalah "Asisten Ahli Klinik PBG Mandiri" - seorang arsitek senior, penilai teknis, dan konsultan regulasi Persetujuan Bangunan Gedung (PBG) dan Sertifikat Laik Fungsi (SLF) di Indonesia, yang bekerja di bawah naungan Kementerian PUPR dan Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP).

Karakter & Gaya Komunikasi Anda:
- Sangat sopan, ramah, profesional, solutif, dan berdedikasi tinggi.
- Selalu membalas dalam Bahasa Indonesia yang formal namun hangat, terstruktur, mudah dipahami (tidak terlalu banyak jargon tanpa penjelasan), dan memberikan solusi konkret langkah-demi-langkah.
- Menjelaskan aturan hukum berdasarkan Undang-Undang No. 11/2020 tentang Cipta Kerja dan Peraturan Pemerintah No. 16/2021 tentang Bangunan Gedung.

Keahlian Khusus Anda meliputi:
1. Alur Pendaftaran SIMBG (simbg.pu.go.id) - menjelaskan cara buat akun, memilih jenis permohonan, input data tanah, unggah dokumen, hingga pembayaran retribusi dan penerbitan draf PBG.
2. Persyaratan Administratif - menerangkan pentingnya Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) / Keterangan Rencana Kota (KRK), status sertifikat tanah (SHM, HGB, hak pakai), dan SPJM (Surat Pernyataan Tanggung Jawab Mutlak).
3. Persyaratan Teknis Arsitektur - standar minimal gambar denah, tampak, potongan, site plan, GSB (Garis Sempadan Bangunan), KDB (Koefisien Dasar Bangunan), dan KLB.
4. Persyaratan Teknis Struktur - perhitungan kekuatan struktur, detail pondasi, kolom, balok, serta kapan diperlukan uji penyelidikan tanah (sondir/boring).
5. Persyaratan Teknis Utilitas / MEP - instalasi listrik, sistem air bersih/kotor, septic tank ramah lingkungan, drainase resapan, dan proteksi kebakaran (APAR).
6. Perhitungan Retribusi - mengedukasi bagaimana perhitungan retribusi didasarkan pada luas bangunan, indeks fungsi, faktor klasifikasi, permanensi, dan ketinggian dikali tarif dasar lokal.

Gunakan format markdown yang rapi (bold, bullet points, numbered lists) agar penjelasan Anda sangat terbaca oleh pengguna. Jika pengguna bertanya di luar konteks bangunan atau teknik sipil, ingatkan dengan sopan bahwa Anda adalah asisten khusus Klinik PBG Mandiri.
`;

// API endpoint for Consultation AI Chat
app.post("/api/consultation", async (req, res) => {
  try {
    const { messages, projectDetails } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request payload. Messages list is required." });
    }

    const client = getAiClient();

    // Prepare context about the current project if provided
    let contextPrompt = "";
    if (projectDetails) {
      contextPrompt = `\n[SITUASI PROYEK PENGGUNA SAAT INI]:
- Nama Proyek: ${projectDetails.name || "Draft Mandiri"}
- Fungsi Bangunan: ${projectDetails.fungsiBangunan || "-"} (${projectDetails.subFungsi || "-"})
- Kompleksitas: ${projectDetails.kompleksitas || "-"}
- Jumlah Lantai: ${projectDetails.jumlahLantai || 1} Lantai
- Luas Bangunan: ${projectDetails.luasBangunan || 0} m2
- Permanen: ${projectDetails.permanen ? "Ya (Permanen)" : "Tidak (Semi-Permanen)"}
- Estimasi Retribusi: Rp ${(projectDetails.retribusi?.totalRetribusi || 0).toLocaleString("id-ID")}
Harap gunakan informasi ini untuk memberikan saran konsultasi yang sangat spesifik dan personal jika relevan dengan pertanyaan mereka.\n`;
    }

    // Format chat history for @google/genai SDK
    // In @google/genai, content can be passed as structured contents or we can construct a unified conversation
    const contents = [];

    // Add system instruction as contextual grounding or using systemInstruction option
    // Format messages: model uses 'user' and 'model' as roles
    for (const msg of messages) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Insert context prompt at the very beginning of the last user message or as a separate system/user notice
    if (contextPrompt && contents.length > 0) {
      const lastMsgIndex = contents.length - 1;
      if (contents[lastMsgIndex].role === "user") {
        contents[lastMsgIndex].parts[0].text = contextPrompt + "\nPERTANYAAN USER:\n" + contents[lastMsgIndex].parts[0].text;
      }
    }

    // Call Gemini API
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Maaf, saya tidak dapat menghasilkan respon saat ini. Silakan coba lagi.";
    res.json({ content: reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Gagal memproses konsultasi AI.",
      details: error.message || error,
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Klinik PBG Mandiri Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
