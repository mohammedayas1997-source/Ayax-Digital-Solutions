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

  // SECURE KEY INJECTION - Direct use of the key you provided to ensure it works on the live site.
  const genAI = new GoogleGenerativeAI(
    "AIzaSyA-p9wWpBXRcdfjlqlkRbvZgm0BggNWirI",
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

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
        - Creator/CEO: Abdulrahman Mohammed Ayas. He is a visionary tech leader. Find him on Facebook.
        - Tone: High professional authority, technical precision, and soulful mentorship.
        
        ACADEMY PROTOCOLS & ORIENTATION:
        - Course Duration: 24 Weeks. No skipping; mastery requires consistency.
        - Midterm Hurdle: Advancement to Phase 2 (Weeks 13-24) requires passing the Week 12 Exam.
        - Forum Rule: To unlock the next week, students must post an assignment (100+ chars) and give scholarly feedback to at least 3 peers.
        - Certification: Global certificate with QR Authentication for instant worldwide verification.
        
        KNOWLEDGE DOMAIN:
        - Expert in Full-Stack Development, Cybersecurity, AI Automation, Cloud Infrastructure, School Management Systems, and Government Portals.
        - Mission: "Turn effort into impact and ideas into powerful digital realities."
        - Privacy Policy: Updated 02/02/2026. We do not sell data. Institutional data remains client property.
        
        BEHAVIOR:
        - Respond in Hausa, English, or French based on the user's language.
        - If asked about the Student Portal, explain the 24-week structure and Temporal Locking.
        - Give deep technical analysis when asked about tech tracks.
      `,
      });

      // CONTENT GENERATION
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback only if the API fails entirely
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ayax system relay is experiencing heavy traffic. Please check your internet or refresh.",
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
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 flex flex-col">
          {/* Header */}
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

          {/* Chat Interface */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar flex-grow">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-[1.8rem] text-[13px] leading-relaxed font-bold shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center px-4">
                <Sparkles size={14} className="text-blue-600 animate-bounce" />
                <p className="text-[10px] font-black text-blue-600 uppercase">
                  Ayax is processing...
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-5 bg-white border-t flex gap-3"
          >
            <input
              className="flex-1 bg-gray-100 p-4 rounded-2xl outline-none text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="Ask about portal, tech, or mission..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      <style>{` .animate-spin-slow { animation: spin 8s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } `}</style>
    </div>
  );
};

export default AIAssistant;
