import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Sparkles, User, ShieldCheck } from "lucide-react";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am AYAX Intelligence. How can I help you explore Abdulrahman Ayas’s Digital Academy today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  // THE KNOWLEDGE BASE (THE BRAIN)
  const KNOWLEDGE_BASE = {
    ceo: "Abdulrahman Mohammed Ayas",
    company: "AYAX Digital Solutions Academy",
    founded: "2026",
    mission:
      "To empower the next generation of digital experts in Nigeria through high-end technical training.",
    services: [
      "Web Development (Full-Stack)",
      "Cybersecurity & Digital Surveillance",
      "UI/UX Design",
      "Digital Marketing & Automation",
      "Software Engineering",
    ],
    infrastructure:
      "High-speed digital labs, 24/7 support, and globally recognized certifications.",
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // AI LOGIC (Simulated Intelligence for AYAX)
    setTimeout(() => {
      let aiResponse = "";
      const query = input.toLowerCase();

      if (
        query.includes("who is the owner") ||
        query.includes("ceo") ||
        query.includes("boss")
      ) {
        aiResponse = `The CEO and Founder of AYAX Academy is ${KNOWLEDGE_BASE.ceo}. He is a visionary leader in digital infrastructure.`;
      } else if (query.includes("course") || query.includes("study")) {
        aiResponse = `We offer premium courses in ${KNOWLEDGE_BASE.services.join(", ")}. Which one interests you?`;
      } else if (query.includes("location") || query.includes("where")) {
        aiResponse =
          "We are located at the AYAX Digital Hub. You can also study 100% online through our portal.";
      } else {
        aiResponse =
          "I am trained by AYAX Academy. I can tell you about our CEO Abdulrahman Ayas, our technical courses, or help you with enrollment.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[500]">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all animate-bounce"
        >
          <Bot size={30} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-gray-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-blue-500" size={20} />
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest">
                  AYAX AI Agent
                </h3>
                <p className="text-[9px] opacity-50">
                  Powered by Ayax Infrastructure
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border rounded-tl-none shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <p className="text-[10px] font-black animate-pulse text-blue-600 uppercase">
                AYAX AI is thinking...
              </p>
            )}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t flex gap-2"
          >
            <input
              className="flex-1 bg-gray-100 p-3 rounded-xl outline-none text-xs font-bold"
              placeholder="Ask about AYAX or Abdulrahman Ayas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="p-3 bg-gray-900 text-white rounded-xl">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
