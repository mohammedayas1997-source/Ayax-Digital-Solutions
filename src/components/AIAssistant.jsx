import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Sparkles, Globe, ShieldCheck } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const scrollRef = useRef();

  // --- MASTER FIX: DIRECT API KEY ---
  const MASTER_KEY = "AIzaSyA-p9wWpBXRcdfjlqlkRbvZgm0BggNWirI";

  const AYAX_CORE = {
    name: "Ayax",
    ceo: "Abdulrahman Mohammed Ayas",
    company: "AYAX Digital Solutions Academy (Global)",
    expertise:
      "Full-Stack Development, Cybersecurity, AI Automation, Cloud Infrastructure",
    global_reach:
      "Serving students and clients across Africa, Europe, and North America.",
    vision:
      "To bridge the gap between local talent and global tech opportunities.",
    contact: "ayaxdigitalsolutions@gmail.com",
    headquarters: "Digital Hub, Nigeria (Global Operations)",
  };

  useEffect(() => {
    let sessionId = localStorage.getItem("ayax_ai_session");
    if (!sessionId) {
      sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ayax_ai_session", sessionId);
    }
    setChatSessionId(sessionId);
  }, []);

  useEffect(() => {
    if (!chatSessionId || !isOpen) return;

    const q = query(
      collection(db, "ai_chat_history"),
      where("sessionId", "==", chatSessionId),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const history = snap.docs.map((doc) => doc.data());
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              "Greeting from AYAX Global Headquarters. I am Ayax, your specialized AI consultant. How can I assist you today?",
            createdAt: new Date(),
          },
        ]);
      }
      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });

    return () => unsubscribe();
  }, [chatSessionId, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userEmail = auth.currentUser?.email || "Guest_User";

    setInput("");
    setIsTyping(true);

    try {
      // Tabbatar an yi initialization na SDK a nan don sauri
      const genAI = new GoogleGenerativeAI(MASTER_KEY);

      // 1. Log user message to Firestore immediately
      await addDoc(collection(db, "ai_chat_history"), {
        sessionId: chatSessionId,
        userEmail: userEmail,
        role: "user",
        content: userText,
        createdAt: serverTimestamp(),
      });

      // 2. Initialize Gemini 1.5 Flash Model
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
            You are 'Ayax', the official Global AI Ambassador for AYAX Digital Solutions Academy.
            CEO: ${AYAX_CORE.ceo}.
            Expertise: ${AYAX_CORE.expertise}.
            Languages: Master of Hausa, English, and French. Always respond in the language used by the user.
            Tone: Professional, authoritative, and helpful.
          `,
      });

      // 3. Start Content Stream
      const result = await model.generateContentStream(userText);
      let fullResponse = "";

      // Add a placeholder for AI response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullResponse;
          return updated;
        });
      }

      // 4. Save finalized AI response to Firestore
      await addDoc(collection(db, "ai_chat_history"), {
        sessionId: chatSessionId,
        userEmail: userEmail,
        role: "assistant",
        content: fullResponse,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Gemini Critical Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ina neman afuwa, an samu matsalar sadarwa da uwar garken AYAX. Don Allah sake jaraba aiko sakonka ko ka duba internet dinka.",
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-500"
        >
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse"></div>
          <Bot size={32} strokeWidth={1.5} />
          <span className="absolute -left-24 bg-gray-900 text-white text-[10px] py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity font-black uppercase tracking-widest">
            Chat with Ayax
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 flex flex-col">
          <div className="bg-gray-950 p-7 text-white shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em]">
                    Ayax Intelligence
                  </h3>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
                    Surveillance Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="opacity-30 hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar flex-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-[1.8rem] text-[13px] leading-relaxed font-bold shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-widest px-4">
                Ayax is thinking...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-5 bg-white border-t border-gray-50 flex gap-3 shrink-0"
          >
            <input
              className="flex-1 bg-gray-100 p-4 rounded-2xl outline-none text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:bg-white text-slate-900"
              placeholder="Hausa, English, French..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AIAssistant;
