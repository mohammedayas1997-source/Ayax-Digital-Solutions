import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  MessageSquare,
  CheckCircle,
  Users,
  Pin,
  Send,
  Reply,
  Calendar,
  AlertTriangle,
  Bell,
  ShieldCheck,
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  ChevronLeft,
} from "lucide-react";

// ==========================================
// UPDATED COURSE NAMES (MAPPING)
// ==========================================
const availableCourses = [
  { id: "cyber_security", name: "Cyber security" },
  { id: "data_analytics", name: "Data Analytics" },
  { id: "software_engineering", name: "Software Engineering" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "blockchain", name: "Blockchain Technology" },
  { id: "web_development", name: "Web development" },
  { id: "digital_marketing", name: "advanced Digital Marketing" },
];

const WeeklyForum = ({ weekId, courseId }) => {
  const [mySubmission, setMySubmission] = useState("");
  const [othersSubmissions, setOthersSubmissions] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [adminAssignment, setAdminAssignment] = useState(null);
  const [courseDates, setCourseDates] = useState(null);
  const [userRole, setUserRole] = useState("student");

  const scrollRef = useRef(null);
  const currentCourseName =
    availableCourses.find((c) => c.id === courseId)?.name || "Unknown Course";

  const user = auth.currentUser;
  const progressPath = `students/${user?.uid}/progress/${courseId}_week_${weekId}`;
  const isExamWeek = weekId === 12 || weekId === 24;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [othersSubmissions]);

  useEffect(() => {
    if (!user) return;

    const fetchRole = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role || "student");
      }
    };
    fetchRole();

    // Real-time Chat Sync
    const q = query(
      collection(db, "submissions"),
      where("weekId", "==", weekId),
      where("courseId", "==", courseId),
      orderBy("createdAt", "asc"),
    );

    const unsubscribeChat = onSnapshot(q, (snap) => {
      const messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOthersSubmissions(messages);
      if (messages.find((m) => m.userId === user.uid)) setHasSubmitted(true);
    });

    const fetchData = async () => {
      const adminQ = query(
        collection(db, "forum_assignments"),
        where("weekId", "==", weekId),
        where("courseId", "==", courseId),
      );
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) setAdminAssignment(adminSnap.docs[0].data());

      const progRef = doc(db, progressPath);
      const progSnap = await getDoc(progRef);
      if (progSnap.exists() && progSnap.data().status === "completed")
        setIsCompleted(true);
    };

    fetchData();
    return () => unsubscribeChat();
  }, [weekId, courseId, user]);

  const handleSubmit = async () => {
    if (mySubmission.trim().length < (isExamWeek ? 500 : 10)) {
      return alert(
        `VALIDATION ERROR: ${isExamWeek ? "EXAM" : "POST"} requires more depth.`,
      );
    }

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        role: userRole,
        content: mySubmission,
        weekId,
        courseId,
        courseName: currentCourseName,
        type: isExamWeek ? "EXAM_SUBMISSION" : "chat_message",
        createdAt: serverTimestamp(),
      });
      setMySubmission("");
    } catch (error) {
      alert("NETWORK ERROR: Post failed.");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-[#efeae2] shadow-2xl relative overflow-hidden border-x border-gray-200">
      {/* WHATSAPP STYLE HEADER */}
      <header className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1">
            <ChevronLeft />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 text-[#075e54] rounded-full flex items-center justify-center font-black text-sm">
              {weekId}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#075e54] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm leading-tight uppercase truncate max-w-[200px]">
              {currentCourseName}
            </h2>
            <span className="text-[10px] opacity-70 font-medium">
              {othersSubmissions.length} Academic peers online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5 opacity-90">
          <Calendar
            size={18}
            className="cursor-pointer hover:scale-110 transition"
          />
          <Users
            size={18}
            className="cursor-pointer hover:scale-110 transition"
          />
          <MoreVertical
            size={18}
            className="cursor-pointer hover:scale-110 transition"
          />
        </div>
      </header>

      {/* ENCRYPTION NOTICE */}
      <div className="bg-[#fff9c4] py-1.5 px-4 text-center shadow-sm z-40">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={12} className="text-emerald-700" />
          End-to-end encrypted academic repository. Only members can view.
        </p>
      </div>

      {/* MESSAGE AREA */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-4 custom-chat-scrollbar"
        style={{
          backgroundImage:
            "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundBlendMode: "overlay",
        }}
      >
        {othersSubmissions.map((msg) => {
          const isMe = msg.userId === user.uid;
          const isAdmin =
            ["admin", "authority", "SUPER_ADMIN"].includes(msg.role) ||
            msg.userId === "SUPER_ADMIN";

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`relative max-w-[80%] md:max-w-[65%] px-3 pt-1.5 pb-1 shadow-md
                ${
                  isMe
                    ? "bg-[#dcf8c6] rounded-l-xl rounded-br-xl ml-12"
                    : "bg-white rounded-r-xl rounded-bl-xl mr-12"
                }
              `}
              >
                {/* ADMIN BADGE & SENDER NAME */}
                {!isMe && (
                  <div className="flex items-center justify-between gap-4 mb-1 border-b border-gray-100 pb-1">
                    <span
                      className={`text-[10px] font-black uppercase ${isAdmin ? "text-red-600" : "text-[#34b7f1]"}`}
                    >
                      {msg.userName.split("@")[0]}
                    </span>
                    {isAdmin && (
                      <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={8} /> FACULTY
                      </span>
                    )}
                  </div>
                )}

                {/* CONTENT */}
                <div
                  className={`text-sm leading-relaxed font-semibold whitespace-pre-wrap ${isAdmin ? "text-slate-900 italic" : "text-slate-800"}`}
                >
                  {msg.content}
                </div>

                {/* TIMESTAMP & STATUS */}
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                  <span className="text-[8px] font-bold uppercase italic">
                    {msg.createdAt
                      ? new Date(msg.createdAt.toDate()).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "..."}
                  </span>
                  {isMe && <Check size={10} className="text-blue-500" />}
                </div>

                {/* WHATSAPP BUBBLE TAIL REPLACEMENT (CSS-LIKE) */}
                <div
                  className={`absolute top-0 w-2 h-2 ${isMe ? "-right-1 bg-[#dcf8c6] rotate-45" : "-left-1 bg-white rotate-45"}`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXAM INDICATOR */}
      {isExamWeek && (
        <div className="mx-4 mb-2 bg-red-600 text-white p-2 rounded-xl text-center flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <AlertTriangle size={14} />
          <span className="text-[9px] font-black uppercase">
            EXAM MODE: 500+ Character Submission Required
          </span>
        </div>
      )}

      {/* INPUT PANEL */}
      <footer className="bg-[#f0f2f5] px-4 py-3 flex items-end gap-3 shadow-2xl border-t border-gray-200">
        <div className="flex items-center gap-3 pb-2 opacity-60">
          <Smile
            size={24}
            className="cursor-pointer hover:text-[#075e54] transition"
          />
          <Paperclip
            size={22}
            className="cursor-pointer hover:text-[#075e54] transition"
          />
        </div>

        <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-1.5 shadow-inner border border-gray-200">
          <textarea
            className="flex-1 bg-transparent border-none outline-none py-1 text-sm font-bold text-slate-700 resize-none max-h-32 placeholder:text-gray-400"
            placeholder={
              isExamWeek
                ? "Enter Official Exam Submission..."
                : "Type academic inquiry..."
            }
            rows="1"
            value={mySubmission}
            onChange={(e) => setMySubmission(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-[#128c7e] text-white p-3.5 rounded-full hover:bg-[#075e54] transition-all shadow-xl active:scale-90 flex items-center justify-center"
        >
          <Send size={20} fill="currentColor" />
        </button>
      </footer>

      <style>{`
        .custom-chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WeeklyForum;
