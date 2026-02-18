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

  // 1. AUTH & THEME PERSISTENCE ENGINE
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

  // 2. REAL-TIME DATA SYNC (FORUM & STUDENTS)
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

    return () => {
      unsubStudents();
      unsubForum();
    };
  }, [selectedCourse]);

  // 3. THREAD REPLY STREAMING
  useEffect(() => {
    if (!activeThread) return;
    const unsubReplies = onSnapshot(
      query(
        collection(db, `forum_threads/${activeThread.id}/replies`),
        orderBy("createdAt", "asc"),
      ),
      (snap) => setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return () => unsubReplies();
  }, [activeThread]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
        text: reply,
        sender: supervisorName,
        role: "supervisor",
        createdAt: serverTimestamp(),
      });
      setReply("");
    } catch (err) {
      console.error("INJECTION_ERROR: Reply failed.");
    }
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
            <h1 className="text-6xl font-black italic tracking-tighter mb-4 text-blue-600">
              AYAX.SV
            </h1>
            <p
              className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Access Level: Authorized
            </p>
            <h2
              className={`text-3xl font-bold mt-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Welcome, {supervisorName}
            </h2>
            <p className="text-slate-500 mt-4 leading-relaxed text-lg">
              Select a department to monitor academic integrity and forum
              activity.
            </p>
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
      {/* SIDEBAR - SUPERVISOR SPECIFIC */}
      <aside
        className={`w-72 border-r p-8 flex flex-col sticky top-0 h-screen ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
      >
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer"
          onClick={() => setSelectedCourse(null)}
        >
          <div className="p-2 bg-blue-600 rounded-xl text-white">
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
            onClick={() => setActiveTab("students")}
            className={`t-nav ${activeTab === "students" ? "t-active" : ""}`}
          >
            <Users size={18} /> Student Roster
          </button>
        </nav>

        <div className="space-y-4 pt-10 border-t border-slate-800">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-600"}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
            {isDarkMode ? "Light" : "Dark"} Mode
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
          >
            <LogOut size={18} /> Logout Terminal
          </button>
        </div>
      </aside>

      {/* MAIN ANALYTICS HUB */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              {activeTab} Hub
            </h1>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {selectedCourse} | Supervisor View
            </p>
          </div>
          <button
            onClick={() => setSelectedCourse(null)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"}`}
          >
            Switch Department
          </button>
        </header>

        {/* FORUM INTERFACE */}
        {activeTab === "forum" && (
          <div className="flex gap-8 h-[75vh]">
            <div
              className={`w-1/3 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="p-6 border-b border-slate-800 font-black uppercase text-[10px] opacity-50">
                Active Discussions
              </div>
              <div className="overflow-y-auto flex-1">
                {forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-6 border-b border-slate-800 cursor-pointer transition-all ${activeThread?.id === thread.id ? "bg-blue-600 text-white" : isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}
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
                        className={`max-w-[80%] p-4 rounded-3xl ${msg.role === "supervisor" ? "bg-blue-600 text-white self-end rounded-tr-none" : isDarkMode ? "bg-slate-800 text-white self-start rounded-tl-none border border-slate-700" : "bg-slate-100 text-slate-900 self-start rounded-tl-none"}`}
                      >
                        <p className="text-[9px] font-black uppercase mb-1 opacity-70">
                          {msg.sender}{" "}
                          {msg.role === "supervisor" && "• Supervisor"}
                        </p>
                        <p className="text-sm font-medium italic">
                          "{msg.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleReply}
                    className={`p-6 border-t flex gap-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
                  >
                    <input
                      className={`flex-1 p-5 rounded-2xl outline-none font-bold text-sm transition-all ${isDarkMode ? "bg-slate-800 text-white focus:bg-slate-700" : "bg-slate-50 text-slate-900 focus:bg-white border border-transparent focus:border-blue-600"}`}
                      placeholder="Expert Response..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button className="p-5 bg-blue-600 text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <MessageSquare size={80} className="mb-4" />
                  <p className="font-black uppercase text-xs tracking-[0.5em]">
                    Select Node
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
                <tr
                  className={`text-[10px] font-black uppercase tracking-widest border-b ${isDarkMode ? "bg-slate-800/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"}`}
                >
                  <th className="p-8">Student Identity</th>
                  <th className="p-8">Track</th>
                  <th className="p-8 text-center">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((std) => (
                  <tr
                    key={std.id}
                    className={`${isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"} transition-colors`}
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
                        Active Access
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
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;
