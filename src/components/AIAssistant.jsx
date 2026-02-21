import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Sparkles, Globe, ShieldCheck } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Greeting from AYAX Global Headquarters. I am Ayax, your specialized AI consultant. How can I assist you with our global digital infrastructure today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  // MASTER INITIALIZATION
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

  const AYAX_CORE = {
    name: "Ayax",
    ceo: "Abdulrahman Mohammed Ayas",
    company: "AYAX Digital Solutions Academy (Global)",
    expertise:
      "Full-Stack Development, Cybersecurity, AI Automation, Cloud Infrastructure",
    vision:
      "To bridge the gap between local talent and global tech opportunities.",
    courses: [
      "Software Engineering (React, Node, Python, Go)",
      "Cybersecurity (Ethical Hacking, Network Defense)",
      "AI & Automation",
      "Cloud Infrastructure",
      "School Management Systems",
      "Government Portals",
      "Fintech & E-commerce Platforms",
    ],
    orientation: {
      roadmap:
        "24-week academic structure with Temporal Locking (weekly releases).",
      exams: "Midterm hurdle at Week 12. Final Exam at Week 24.",
      rules: "3-Reply Rule in forums. Minimum 100 characters for posts.",
      certification:
        "Ayax International Certificate with QR Authentication for global registry verification.",
    },
    privacy_policy_date: "02/02/2026",
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
        You are 'Ayax', the official Global AI Ambassador for AYAX Digital Solutions Academy.
        
        IDENTITY:
        - Creator/CEO: Abdulrahman Mohammed Ayas (Visionary tech leader).
        - Authority: Professional, technical, authoritative.
        
        KNOWLEDGE BASE (ACADEMY PROTOCOLS):
        - Courses: ${AYAX_CORE.courses.join(", ")}.
        - Structure: 24 weeks total. Modules are temporally locked (released weekly).
        - Requirements: Pass Week 12 Midterm to reach Phase 2. Weekly forum requires 3 peer replies.
        - Certification: Global certificate with QR verification registry.
        
        LEGAL & PRIVACY:
        - Privacy Policy (Updated ${AYAX_CORE.privacy_policy_date}): We do not sell data. All project data for NGOs/Gov remains client property.
        - Ethics: Plagiarism results in immediate expulsion.
        
        ABOUT US:
        - We build Gov portals, Fintech, and School Management systems.
        - Mission: "Turn effort into impact and ideas into powerful digital realities."
        
        BEHAVIOR:
        - Speak Hausa, English, or French as per user preference.
        - If asked about the CEO, speak highly of his vision for global transformation.
        - Never provide generic answers; use the specific technical rules of the Academy.
      `,
      });

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      // STATIC AI BRAIN LOGIC (Fallback if API fails)
      let aiResponse = "";
      const query = input.toLowerCase();

      if (query.includes("course") || query.includes("specialization")) {
        aiResponse = `We offer ${AYAX_CORE.courses.join(", ")}. It is a 24-week roadmap with QR-verified certification.`;
      } else if (
        query.includes("ceo") ||
        query.includes("owner") ||
        query.includes("abdulrahman")
      ) {
        aiResponse = `${AYAX_CORE.ceo} is the founder of AYAX Digital Solutions. He is a premier expert in software architecture.`;
      } else if (query.includes("exam") || query.includes("midterm")) {
        aiResponse = `The Midterm Exam is in Week 12. You must pass it to proceed to the second half of the 24-week program.`;
      } else {
        aiResponse = `As Ayax, I am here to guide you through ${AYAX_CORE.ceo}'s vision. How can I help with our 24-week tech roadmap?`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
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
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 flex flex-col">
          <div className="bg-gray-950 p-7 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe size={20} className="animate-spin-slow text-blue-500" />
                <div>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em]">
                    Ayax Intelligence
                  </h3>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
                    Global System Active
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

          <div className="h-[400px] overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-[1.8rem] text-[13px] leading-relaxed font-bold shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border rounded-tl-none shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <Sparkles size={14} className="text-blue-600 animate-bounce" />
                <p className="text-[10px] font-black text-blue-600 uppercase">
                  Ayax is processing database...
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-5 bg-white border-t flex gap-3"
          >
            <input
              className="flex-1 bg-gray-100 p-4 rounded-2xl outline-none text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="Ask about courses, exams, or our mission..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all">
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
