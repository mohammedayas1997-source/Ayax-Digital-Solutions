import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Send,
  Mail,
  MessageSquare,
  PlusCircle,
  LayoutGrid,
  CheckCircle,
  Calendar,
  Video,
  FileText,
  ClipboardList,
  Moon,
  Sun,
  Trash2,
  Reply,
  ShieldAlert,
  Loader2,
  LogOut,
  X,
  Menu,
  ShieldCheck,
  Save,
  RefreshCcw,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lms");
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("admin-theme") === "dark",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialSync, setInitialSync] = useState(true);

  // --- DATA STATES (Asalin Aikinka) ---
  const [inquiries, setInquiries] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("web_dev");

  // --- FORM STATES (Don Karatun Videos/PDF/Assignments) ---
  const [weekData, setWeekData] = useState({
    title: "",
    videoId: "",
    pdfUrl: "",
    assignment: "",
    startDate: "", // Don saita Date da Time
  });

  const [replyText, setReplyText] = useState({});

  // Firestore Reference Helper
  const getWeekRef = () =>
    doc(db, "courses", selectedCourse, "weeks", `week_${selectedWeek}`);

  // 1. ASALIN LOGIC: Fetch Inquiries & Forum (Real-time)
  useEffect(() => {
    const unsubInquiries = onSnapshot(
      query(collection(db, "inquiries"), orderBy("createdAt", "desc")),
      (snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setInitialSync(false);
      },
      (error) => {
        console.error("Inquiry Sync Error:", error);
        setInitialSync(false);
      },
    );

    const unsubForum = onSnapshot(
      query(collection(db, "forum_threads"), orderBy("createdAt", "desc")),
      (snap) =>
        setForumThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubInquiries();
      unsubForum();
    };
  }, []);

  // 2. LMS LOGIC: Load Week Content (Duba abinda ke Database)
  useEffect(() => {
    const fetchWeekSettings = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(getWeekRef());
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWeekData({
            title: data.title || "",
            videoId: data.videoId || "",
            pdfUrl: data.pdfUrl || "",
            assignment: data.assignment || "",
            startDate: data.startDate?.toDate
              ? data.startDate.toDate().toISOString().slice(0, 16)
              : data.startDate || "",
          });
        } else {
          setWeekData({
            title: "",
            videoId: "",
            pdfUrl: "",
            assignment: "",
            startDate: "",
          });
        }
      } catch (error) {
        console.error("Error fetching week settings:", error);
      }
      setLoading(false);
    };
    fetchWeekSettings();
  }, [selectedWeek, selectedCourse]);

  // 3. UPDATE/SAVE LOGIC: Tura karatun (Videos/PDF/Assignment)
  const handleUpdateWeek = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(
        getWeekRef(),
        {
          ...weekData,
          startDate: weekData.startDate
            ? new Date(weekData.startDate)
            : serverTimestamp(),
          weekNumber: Number(selectedWeek),
          courseId: selectedCourse,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert(
        `SYSTEM_SYNC: Week ${selectedWeek} of ${selectedCourse} is now deployed.`,
      );
    } catch (error) {
      alert("CRITICAL_SYNC_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE LOGIC: Goge karatun satin
  const handleDeleteWeek = async () => {
    if (
      window.confirm(`Permanently wipe all content for Week ${selectedWeek}?`)
    ) {
      setLoading(true);
      try {
        await deleteDoc(getWeekRef());
        setWeekData({
          title: "",
          videoId: "",
          pdfUrl: "",
          assignment: "",
          startDate: "",
        });
        alert("WIPED: Week content removed from live server.");
      } catch (error) {
        alert("DELETE_FAILED");
      } finally {
        setLoading(false);
      }
    }
  };

  // 5. ASALIN LOGIC: Forum Reply
  const handleForumReply = async (threadId) => {
    if (!replyText[threadId]) return;
    try {
      const threadRef = doc(db, "forum_threads", threadId);
      await updateDoc(threadRef, {
        adminReply: replyText[threadId],
        repliedAt: serverTimestamp(),
        status: "resolved",
      });
      setReplyText({ ...replyText, [threadId]: "" });
      alert("AUTHORITY_RESPONSE INJECTED");
    } catch (err) {
      alert("TRANSMISSION_FAILED");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Logout from Command Center?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  if (initialSync) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs">
          Decrypting Terminal Data...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[200] w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ${isDarkMode ? "bg-slate-900 border-r border-white/5" : "bg-white border-r border-gray-200"}`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-10">
            <ShieldCheck className="text-blue-600" size={32} />
            <h1 className="font-black italic text-xl">AYAX CORE</h1>
          </div>

          <nav className="flex-1 space-y-3">
            {[
              { id: "lms", label: "LMS Manager", icon: <BookOpen size={18} /> },
              {
                id: "forum",
                label: "Forum Patrol",
                icon: <MessageSquare size={18} />,
              },
              {
                id: "inquiries",
                label: "Lead Registry",
                icon: <Mail size={18} />,
              },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveTab(btn.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === btn.id ? "bg-blue-600 text-white" : "opacity-50 hover:opacity-100"}`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </nav>

          <div className="space-y-4 pt-10 border-t border-white/5">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full p-4 rounded-2xl bg-blue-600/10 text-xs font-black uppercase flex items-center gap-3"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} Protocol
              Mode
            </button>
            <button
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase flex items-center gap-3"
            >
              <LogOut size={18} /> Logout Terminal
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-3 bg-blue-600 rounded-xl text-white"
            >
              <Menu />
            </button>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              {activeTab} <span className="text-blue-600">Control</span>
            </h2>
          </div>
          {loading && <RefreshCcw className="animate-spin text-blue-500" />}
        </header>

        {/* 1. LMS MANAGER: Inda kake son Videos, PDF, Assignment, da Date */}
        {activeTab === "lms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
            <div className="lg:col-span-2">
              <div
                className={`p-8 md:p-12 rounded-[3.5rem] border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100 shadow-xl"}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white">
                      <PlusCircle size={24} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
                      Week {selectedWeek} Settings
                    </h2>
                  </div>
                  <div className="flex gap-4">
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="p-3 rounded-xl font-black text-[10px] uppercase bg-blue-600/10 border-none outline-none"
                    >
                      <option value="web_dev">Web Dev</option>
                      <option value="software_eng">Software Eng</option>
                    </select>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="p-3 rounded-xl font-black text-[10px] uppercase bg-blue-600/10 border-none outline-none"
                    >
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Week {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <form onSubmit={handleUpdateWeek} className="space-y-6">
                  <div className="space-y-2">
                    <label className="label">Lesson Title</label>
                    <input
                      className="admin-input"
                      placeholder="e.g. Mastering Advanced Tailwind CSS"
                      value={weekData.title}
                      onChange={(e) =>
                        setWeekData({ ...weekData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">YouTube Video ID</label>
                      <input
                        className="admin-input"
                        placeholder="ID Only (e.g. dQw4w9WgXcQ)"
                        value={weekData.videoId}
                        onChange={(e) =>
                          setWeekData({ ...weekData, videoId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Resource PDF URL</label>
                      <input
                        className="admin-input"
                        placeholder="Link to PDF asset"
                        value={weekData.pdfUrl}
                        onChange={(e) =>
                          setWeekData({ ...weekData, pdfUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label text-blue-500">
                      Scheduled Activation (Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      className="admin-input border-blue-600/30"
                      value={weekData.startDate}
                      onChange={(e) =>
                        setWeekData({ ...weekData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Assignment Specification</label>
                    <textarea
                      className="admin-input h-32 pt-4"
                      placeholder="Technical requirements for this week..."
                      value={weekData.assignment}
                      onChange={(e) =>
                        setWeekData({ ...weekData, assignment: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Push Module
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteWeek}
                      className="p-5 border-2 border-red-600 text-red-600 rounded-3xl font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div
              className={`p-8 rounded-[3.5rem] border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100 shadow-xl"}`}
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-6 flex items-center gap-2">
                <ClipboardList size={14} /> Module Audit
              </h3>
              <div className="space-y-4 text-xs font-bold opacity-60 italic">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span>State</span>
                  <span className="text-emerald-500">Encrypted</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span>Week</span>
                  <span>{selectedWeek} / 24</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FORUM PATROL (Asalin Logic Dinka Ya Dawo) */}
        {activeTab === "forum" && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-right-10 duration-700">
            {forumThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-10 rounded-[3.5rem] border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-lg">
                      {thread.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-lg tracking-tighter">
                        {thread.studentName}
                      </h4>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        Node: {thread.courseId} • {thread.studentType}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest border ${thread.status === "resolved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"}`}
                  >
                    {thread.status === "resolved"
                      ? "Closed"
                      : "Awaiting Authority"}
                  </span>
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-3 tracking-tight">
                  "{thread.title}"
                </h3>
                <p className="text-sm font-medium leading-relaxed mb-8 opacity-70">
                  {thread.content}
                </p>

                {thread.adminReply && (
                  <div className="mb-8 p-8 bg-blue-600/5 border-l-8 border-blue-600 rounded-[2rem] italic">
                    <span className="block font-black uppercase text-[9px] text-blue-600 mb-2 tracking-widest">
                      Reply Archive:
                    </span>
                    <p className="text-sm font-bold opacity-80">
                      "{thread.adminReply}"
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <input
                    className="admin-input flex-1"
                    placeholder="Official response..."
                    value={replyText[thread.id] || ""}
                    onChange={(e) =>
                      setReplyText({
                        ...replyText,
                        [thread.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => handleForumReply(thread.id)}
                    className="px-10 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3"
                  >
                    <Reply size={16} /> Inject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. LEADS REGISTRY (Asalin Logic Dinka Ya Dawo) */}
        {activeTab === "inquiries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
            {inquiries.map((item) => (
              <div
                key={item.id}
                className={`p-10 rounded-[3.5rem] border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}
              >
                <div className="flex justify-between mb-6">
                  <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-blue-600 text-white rounded-full tracking-widest">
                    {item.serviceTier || "General"}
                  </span>
                  <p className="text-[10px] font-black opacity-30">
                    {item.createdAt?.seconds
                      ? new Date(
                          item.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : "SYNC..."}
                  </p>
                </div>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">
                  {item.fullName}
                </h4>
                <p className="text-[10px] font-black text-blue-500 mb-8 tracking-wider">
                  IDENT: {item.email}
                </p>
                <div
                  className={`p-6 rounded-[2rem] border-2 border-dashed ${isDarkMode ? "bg-slate-950 border-white/5" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className="text-xs italic font-bold opacity-60 leading-relaxed">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex gap-3 mt-8">
                  <a
                    href={`mailto:${item.email}`}
                    className="flex-1 py-4 bg-slate-800 text-white text-center rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .admin-input { width: 100%; padding: 1.25rem 1.75rem; background: ${isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc"}; border: 2px solid transparent; border-radius: 2rem; font-weight: 800; font-size: 0.8rem; color: inherit; outline: none; transition: 0.4s; }
        .admin-input:focus { border-color: #2563eb; background: ${isDarkMode ? "rgba(255,255,255,0.08)" : "white"}; }
        .label { font-size: 0.7rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; display: block; margin-bottom: 0.75rem; margin-left: 0.5rem; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
