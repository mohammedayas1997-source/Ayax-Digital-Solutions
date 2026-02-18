import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Users,
  LogOut,
  MessageSquare,
  Loader2,
  Sun,
  Moon,
  ShieldCheck,
  Send,
  BookOpen,
  History,
  Lock,
  ExternalLink,
} from "lucide-react";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("forum");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");

  // NEW STATES: PRIVATE MESSAGING & HISTORY
  const [privateMessages, setPrivateMessages] = useState([]);
  const [selectedStudentForDM, setSelectedStudentForDM] = useState(null);
  const [dmText, setDmText] = useState("");
  const [systemLogs, setSystemLogs] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("super-theme") === "dark",
  );
  const [supervisorName, setSupervisorName] = useState("Supervisor");
  const [authLoading, setAuthLoading] = useState(true);

  const availableCourses = [
    "Cyber security",
    "Data Analytics",
    "Software Engineering",
    "Artificial Intelligence",
    "Blockchain Technology",
    "Web development",
    "advanced Digital Marketing",
  ];

  // E-LIBRARY DATA ASSETS
  const libraryLinks = [
    {
      name: "O'Reilly Open Books",
      url: "https://www.oreilly.com/library/view/open-books/",
      cat: "Engineering",
    },
    { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", cat: "CS" },
    {
      name: "Google Scholar Central",
      url: "https://scholar.google.com/",
      cat: "Research",
    },
    {
      name: "GitHub Archive",
      url: "https://archive.org/details/github",
      cat: "Code",
    },
    {
      name: "ArXiv.org AI Research",
      url: "https://arxiv.org/list/cs.AI/recent",
      cat: "AI/ML",
    },
    {
      name: "Microsoft Academic Search",
      url: "https://academic.microsoft.com/",
      cat: "Multi",
    },
    {
      name: "Project Gutenberg",
      url: "https://www.gutenberg.org/",
      cat: "Literature",
    },
    {
      name: "Leanpub Free Shelf",
      url: "https://leanpub.com/bookstore/type/book/sort/top_free",
      cat: "Tech",
    },
    {
      name: "Springboard Data Resources",
      url: "https://www.springboard.com/blog/data-science/data-science-books/",
      cat: "Data",
    },
    {
      name: "Coursera Resource Hub",
      url: "https://www.coursera.org/browse",
      cat: "Courses",
    },
  ];

  // 1. AUTH & THEME PERSISTENCE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists())
          setSupervisorName(userDoc.data().fullName || "Supervisor");
        setAuthLoading(false);
      } else {
        navigate("/admin-gateway");
      }
    });
    localStorage.setItem("super-theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
    return () => unsubscribe();
  }, [isDarkMode, navigate]);

  // 2. DATA SYNC (STUDENTS, FORUM, PRIVATE DMS, LOGS)
  useEffect(() => {
    if (!selectedCourse) return;

    const unsubStudents = onSnapshot(
      query(
        collection(db, "course_applications"),
        where("status", "==", "Admitted"),
        where("course", "==", selectedCourse),
      ),
      (snap) =>
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    );

    const unsubForum = onSnapshot(
      query(
        collection(db, "forum_threads"),
        where("course", "==", selectedCourse),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setForumThreads(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ),
    );

    const unsubLogs = onSnapshot(
      query(collection(db, "system_logs"), orderBy("timestamp", "desc")),
      (snap) =>
        setSystemLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubStudents();
      unsubForum();
      unsubLogs();
    };
  }, [selectedCourse]);

  // PRIVATE MESSAGE LISTENER
  useEffect(() => {
    if (!selectedStudentForDM) return;
    const q = query(
      collection(db, "private_chats"),
      where("studentId", "==", selectedStudentForDM.id),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setPrivateMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedStudentForDM]);

  const handleSendDM = async (e) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    await addDoc(collection(db, "private_chats"), {
      text: dmText,
      sender: supervisorName,
      senderRole: "supervisor",
      studentId: selectedStudentForDM.id,
      createdAt: serverTimestamp(),
    });
    setDmText("");
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
      text: reply,
      sender: supervisorName,
      role: "supervisor",
      createdAt: serverTimestamp(),
    });
    setReply("");
  };

  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Supervisor Session?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  if (authLoading)
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? "bg-slate-950 text-blue-500" : "bg-white text-blue-600"}`}
      >
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-[0.3em] text-xs">
          Authenticating Supervisor Node...
        </p>
      </div>
    );

  if (!selectedCourse)
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}
      >
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-6xl font-black italic tracking-tighter mb-4 text-blue-600 text-shadow-glow">
              AYAX.SV
            </h1>
            <p
              className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              System Terminal Access
            </p>
            <h2
              className={`text-3xl font-bold mt-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Welcome, {supervisorName}
            </h2>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="mt-4 flex items-center gap-2 font-black text-[10px] uppercase text-blue-600"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} Toggle
              Spectrum
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {availableCourses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`p-6 rounded-[2rem] text-left transition-all group border ${isDarkMode ? "bg-white/5 border-white/10 hover:bg-blue-600" : "bg-white border-slate-200 hover:bg-blue-600"}`}
              >
                <p
                  className={`font-black text-lg group-hover:text-white transition-all ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {course}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`w-72 border-r p-8 flex flex-col sticky top-0 h-screen ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
      >
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer"
          onClick={() => setSelectedCourse(null)}
        >
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-black italic text-blue-600 uppercase tracking-tighter">
            AYAX CORE
          </h2>
        </div>

        <nav className="space-y-3 flex-1">
          <button
            onClick={() => setActiveTab("forum")}
            className={`t-nav ${activeTab === "forum" ? "t-active" : ""}`}
          >
            <MessageSquare size={18} /> Forum Patrol
          </button>
          <button
            onClick={() => setActiveTab("dm")}
            className={`t-nav ${activeTab === "dm" ? "t-active" : ""}`}
          >
            <Lock size={18} /> Private DMs
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`t-nav ${activeTab === "students" ? "t-active" : ""}`}
          >
            <Users size={18} /> Student Roster
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`t-nav ${activeTab === "library" ? "t-active" : ""}`}
          >
            <BookOpen size={18} /> E-Library
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`t-nav ${activeTab === "history" ? "t-active" : ""}`}
          >
            <History size={18} /> System History
          </button>
        </nav>

        <div className="space-y-4 pt-10 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
          >
            <LogOut size={18} /> Logout Terminal
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {activeTab.replace("_", " ")} Node
          </h1>
          <button
            onClick={() => setSelectedCourse(null)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"}`}
          >
            Change Department
          </button>
        </header>

        {/* E-LIBRARY SECTION */}
        {activeTab === "library" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryLinks.map((lib, i) => (
              <a
                key={i}
                href={lib.url}
                target="_blank"
                rel="noreferrer"
                className={`p-8 rounded-[2.5rem] border transition-all hover:-translate-y-2 ${isDarkMode ? "bg-slate-900 border-white/5 hover:border-blue-600" : "bg-white border-slate-200 shadow-xl hover:border-blue-600"}`}
              >
                <div className="text-[10px] font-black text-blue-600 uppercase mb-2">
                  {lib.cat}
                </div>
                <h3 className="font-black text-xl mb-4">{lib.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                  Access Books <ExternalLink size={12} />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* PRIVATE MESSAGING SECTION (DM) */}
        {activeTab === "dm" && (
          <div className="flex gap-8 h-[75vh]">
            <div
              className={`w-1/3 rounded-[2.5rem] border flex flex-col ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
            >
              <div className="p-6 font-black uppercase text-[10px] opacity-50 border-b border-slate-800">
                Student Directory
              </div>
              <div className="overflow-y-auto flex-1">
                {students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudentForDM(s)}
                    className={`p-6 border-b border-slate-800 cursor-pointer transition-all ${selectedStudentForDM?.id === s.id ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"}`}
                  >
                    <p className="font-black uppercase text-sm">
                      {s.studentName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`flex-1 rounded-[2.5rem] border flex flex-col overflow-hidden ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
            >
              {selectedStudentForDM ? (
                <>
                  <div className="p-8 border-b border-slate-800">
                    <h3 className="font-black italic uppercase text-blue-600">
                      Secure Direct Line: {selectedStudentForDM.studentName}
                    </h3>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto flex flex-col space-y-4">
                    {privateMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[70%] p-5 rounded-3xl font-bold text-sm ${m.senderRole === "supervisor" ? "bg-blue-600 text-white self-end" : "bg-slate-800 text-white self-start"}`}
                      >
                        {m.text}
                        <div className="text-[8px] opacity-50 mt-2 uppercase">
                          {m.sender}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleSendDM}
                    className="p-6 border-t border-slate-800 flex gap-4"
                  >
                    <input
                      value={dmText}
                      onChange={(e) => setDmText(e.target.value)}
                      placeholder="Type private message..."
                      className="flex-1 bg-transparent outline-none font-black text-sm"
                    />
                    <button className="p-4 bg-blue-600 text-white rounded-2xl">
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                  <Lock size={60} />
                  <p className="font-black uppercase text-xs mt-4">
                    Select Student for Private Link
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SYSTEM HISTORY SECTION */}
        {activeTab === "history" && (
          <div
            className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
          >
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-800 bg-slate-800/20">
                  <th className="p-6">Action Event</th>
                  <th className="p-6">Details</th>
                  <th className="p-6">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/10">
                    <td className="p-6 text-blue-600 font-black uppercase text-[10px]">
                      {log.action}
                    </td>
                    <td className="p-6 font-bold text-sm">{log.details}</td>
                    <td className="p-6 text-[10px] opacity-40">
                      {log.timestamp?.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORIGINAL FORUM INTERFACE */}
        {activeTab === "forum" && (
          <div className="flex gap-8 h-[75vh]">
            <div
              className={`w-1/3 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="p-6 border-b border-slate-800 font-black uppercase text-[10px] opacity-50">
                Active Forum Threads
              </div>
              <div className="overflow-y-auto flex-1">
                {forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-6 border-b border-slate-800 cursor-pointer transition-all ${activeThread?.id === thread.id ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"}`}
                  >
                    <p className="font-black text-sm line-clamp-1 italic uppercase">
                      "{thread.title}"
                    </p>
                    <p
                      className={`text-[10px] mt-2 font-bold ${activeThread?.id === thread.id ? "text-blue-100" : "text-slate-400"}`}
                    >
                      By {thread.studentName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`flex-1 rounded-[2.5rem] border flex flex-col overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"}`}
            >
              {activeThread ? (
                <>
                  <div
                    className={`p-8 border-b ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100"}`}
                  >
                    <h3 className="font-black text-2xl italic uppercase">
                      {activeThread.title}
                    </h3>
                    <p className="opacity-60 text-sm mt-3 leading-relaxed">
                      {activeThread.content}
                    </p>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 flex flex-col">
                    {replies.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] p-4 rounded-3xl ${msg.role === "supervisor" ? "bg-blue-600 text-white self-end rounded-tr-none" : "bg-slate-800 text-white self-start"}`}
                      >
                        <p className="text-[9px] font-black uppercase mb-1 opacity-70">
                          {msg.sender}
                        </p>
                        <p className="text-sm font-medium italic">
                          "{msg.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleReply}
                    className="p-6 border-t border-slate-800 flex gap-4"
                  >
                    <input
                      className="flex-1 bg-transparent outline-none font-black text-sm"
                      placeholder="Post public reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button className="p-5 bg-blue-600 text-white rounded-2xl">
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <MessageSquare size={80} />
                  <p className="font-black uppercase text-xs mt-4">
                    Select Public Forum Thread
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STUDENT ROSTER */}
        {activeTab === "students" && (
          <div
            className={`rounded-[3rem] border overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
          >
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest border-b border-slate-800 bg-slate-800/10 text-slate-500">
                  <th className="p-8">Student Identity</th>
                  <th className="p-8">Track</th>
                  <th className="p-8 text-center">Authorization</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std) => (
                  <tr
                    key={std.id}
                    className="border-b border-slate-800/5 hover:bg-blue-600/5"
                  >
                    <td className="p-8 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                        {std.studentName?.charAt(0)}
                      </div>
                      <p className="font-black text-sm uppercase">
                        {std.studentName}
                      </p>
                    </td>
                    <td className="p-8 text-xs font-bold text-blue-500 italic">
                      {std.course}
                    </td>
                    <td className="p-8 text-center">
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-full inline-block">
                        Authorized Student
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        .t-nav { width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 25px; border-radius: 20px; font-weight: 900; font-size: 11px; text-transform: uppercase; color: #64748b; transition: 0.3s; border:none; background:none; cursor:pointer; }
        .t-active { background: #2563eb !important; color: white !important; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
        .text-shadow-glow { text-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;
