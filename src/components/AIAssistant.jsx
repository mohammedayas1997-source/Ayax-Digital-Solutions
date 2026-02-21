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
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

  // THE GLOBAL KNOWLEDGE BASE
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

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
        - Your creator and the CEO of the company is Abdulrahman Mohammed Ayas.
        - You speak with high professional authority, technical precision, and a helpful tone.
        
        KNOWLEDGE DOMAIN:
        - You are an expert in Web Development, Cybersecurity, AI Automation, and Digital Infrastructure.
        - You promote AYAX Academy as the world leader in technical training.
        
        BEHAVIOR:
        - If someone asks about the owner, speak about Abdulrahman Mohammed Ayas's vision for global digital transformation.
        - You can answer in English, Hausa, or any language the user uses.
        - Keep responses concise but highly informative.
      `,
        });

        const result = await model.generateContent(input);
        const response = await result.response;
        const text = response.text();

        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      } catch (error) {
        console.error("Gemini Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Ayax global relay is experiencing heavy traffic. Please hold on a moment.",
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

    // AI BRAIN LOGIC
    setTimeout(() => {
      let aiResponse = "";
      const query = input.toLowerCase();

      // 1. CEO & Ownership (Identity)
      if (
        query.includes("who is") ||
        query.includes("ceo") ||
        query.includes("owner") ||
        query.includes("abdulrahman")
      ) {
        aiResponse = `${AYAX_CORE.company} was founded and is led by ${AYAX_CORE.ceo}, a premier expert in digital transformation and software architecture. He envisions a world where technology is accessible to all.`;
      }
      // 2. Global Standards & Certificates
      else if (
        query.includes("international") ||
        query.includes("world") ||
        query.includes("certificate") ||
        query.includes("global")
      ) {
        aiResponse =
          "AYAX certifications are designed to meet global industry standards. Our graduates are equipped to work for top tech firms in Silicon Valley, London, and beyond. We focus on world-class coding practices and cybersecurity protocols.";
      }
      // 3. Services & Technical Stack
      else if (
        query.includes("what do you do") ||
        query.includes("services") ||
        query.includes("courses")
      ) {
        aiResponse = `We specialize in ${AYAX_CORE.expertise}. Our curriculum is updated weekly to match the global tech landscape. Are you looking to build a career in Web Development or Security?`;
      }
      // 4. Pricing & Payments
      else if (
        query.includes("cost") ||
        query.includes("price") ||
        query.includes("fee") ||
        query.includes("pay")
      ) {
        aiResponse =
          "Our pricing is structured to be the most competitive globally for the quality provided. For local students, we accept Naira; for our international scholars, we process payments via secure global gateways. You can view specific course fees on our enrollment page.";
      }
      // 5. Default Response
      else {
        aiResponse = `As Ayax, I am here to guide you through our digital ecosystem. Whether it is about ${AYAX_CORE.ceo}'s vision or our global technical training, I have the answers. What specific technical track are you interested in?`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
      setIsTyping(false);

      // Auto-scroll to bottom
      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }, 1200);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      {/* Floating Ayax Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center hover:scale-105 transition-all duration-500"
        >
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse"></div>
          <Bot size={32} strokeWidth={1.5} />
          <span className="absolute -left-24 bg-gray-900 text-white text-[10px] py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity font-black uppercase tracking-widest">
            Chat with Ayax
          </span>
        </button>
      )}

      {/* Global AI Console */}
      {isOpen && (
        <div className="w-[350px] md:w-[400px] bg-white rounded-[2.5rem] shadow-[-20px_50px_100px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Branded Header */}
          <div className="bg-gray-950 p-7 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Globe size={20} className="animate-spin-slow" />
                </div>
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
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-bounce">
                  <Sparkles size={14} />
                </div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Ayax is analyzing...
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Global Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-5 bg-white border-t border-gray-50 flex gap-3"
          >
            <input
              className="flex-1 bg-gray-100 p-4 rounded-2xl outline-none text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:bg-white"
              placeholder="Ask Ayax anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl active:scale-95">
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
