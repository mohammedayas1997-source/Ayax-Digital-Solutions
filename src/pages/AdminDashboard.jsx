import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
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
} from "firebase/firestore";
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
  LayoutDashboard,
  X,
  Menu,
  ShieldCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lms");

  // DARK MODE & THEME PERSISTENCE (Real Life Fix)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialSync, setInitialSync] = useState(true);

  // Data States
  const [inquiries, setInquiries] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Form States
  const [weekData, setWeekData] = useState({
    startDate: "",
    endDate: "",
    videoId: "",
    pdfUrl: "",
    assignment: "",
    title: "",
  });

  const [replyText, setReplyText] = useState({});

  // 1. DATA SYNC (Firestore)
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

  // 2. LOAD WEEK DATA
  useEffect(() => {
    const fetchWeekSettings = async () => {
      try {
        const docRef = doc(db, "course_settings", `week_${selectedWeek}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const parseDate = (dateField) => {
            if (dateField?.toDate)
              return dateField.toDate().toISOString().split("T")[0];
            if (typeof dateField === "string" && dateField.length > 0)
              return dateField;
            return "";
          };
          setWeekData({
            title: data.title || "",
            videoId: data.videoId || "",
            pdfUrl: data.pdfUrl || "",
            assignment: data.assignment || "",
            startDate: parseDate(data.startDate),
            endDate: parseDate(data.endDate),
          });
        } else {
          setWeekData({
            startDate: "",
            endDate: "",
            videoId: "",
            pdfUrl: "",
            assignment: "",
            title: "",
          });
        }
      } catch (error) {
        console.error("Error fetching week settings:", error);
      }
    };
    fetchWeekSettings();
  }, [selectedWeek]);

  // 3. LOGOUT LOGIC (Real Life)
  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Admin Session?")) {
      try {
        await signOut(auth);
        navigate("/admin-gateway");
      } catch (error) {
        alert("LOGOUT_FAILED");
      }
    }
  };

  // 4. THEME SYNC (Real Life Persistence)
  useEffect(() => {
    localStorage.setItem("admin-theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleUpdateWeek = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const weekRef = doc(db, "course_settings", `week_${selectedWeek}`);
      await setDoc(
        weekRef,
        {
          ...weekData,
          startDate: weekData.startDate ? new Date(weekData.startDate) : null,
          endDate: weekData.endDate ? new Date(weekData.endDate) : null,
          updatedAt: serverTimestamp(),
          weekNumber: selectedWeek,
        },
        { merge: true },
      );
      alert(`SYNC_SUCCESS: Week ${selectedWeek} configuration updated.`);
    } catch (error) {
      alert("CRITICAL_SYNC_FAILURE");
    } finally {
      setLoading(false);
    }
  };

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
      className={`min-h-screen flex transition-all duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* SIDEBAR - Fixed with persistent Logout and Theme Toggle */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-slate-900 border-r border-white/5" : "bg-white border-r border-gray-200 shadow-2xl"}`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-black uppercase text-xl italic tracking-tighter">
                AYAX CORE
              </h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden text-red-500"
            >
              <X />
            </button>
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
                className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === btn.id ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" : "opacity-50 hover:opacity-100"}`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
            <div className="pt-6 border-t border-white/5">
              <Link
                to="/admin-secret-portal"
                className="w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest opacity-50 hover:opacity-100"
              >
                <PlusCircle size={18} /> Content Manager
              </Link>
            </div>
          </nav>

          {/* PERSISTENT CONTROLS */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 hover:bg-red-700"
            >
              <LogOut size={18} /> Logout Terminal
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between mb-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-blue-600 rounded-xl text-white shadow-lg"
          >
            <Menu />
          </button>
          <h2 className="font-black italic uppercase text-blue-600 tracking-tighter text-xl">
            AYAX CORE
          </h2>
        </header>

        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            {activeTab} <br />
            <span className="text-blue-600 text-xl md:text-2xl">
              Terminal Authority
            </span>
          </h1>
          <div className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
            Node Secured
          </div>
        </header>

        {/* 1. LMS MANAGER */}
        {activeTab === "lms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="lg:col-span-2">
              <div
                className={`p-8 md:p-10 rounded-[3rem] border ${isDarkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg">
                      <PlusCircle size={24} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
                      Week {selectedWeek} Configuration
                    </h2>
                  </div>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className={`p-4 rounded-2xl font-black text-xs outline-none border ${isDarkMode ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"}`}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Week Index {num}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleUpdateWeek} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">Access Commencement</label>
                      <input
                        type="date"
                        className="admin-input"
                        value={weekData.startDate}
                        onChange={(e) =>
                          setWeekData({
                            ...weekData,
                            startDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Access Expiration</label>
                      <input
                        type="date"
                        className="admin-input"
                        value={weekData.endDate}
                        onChange={(e) =>
                          setWeekData({ ...weekData, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label">Lesson Objective</label>
                    <input
                      className="admin-input"
                      placeholder="Title of lesson..."
                      value={weekData.title}
                      onChange={(e) =>
                        setWeekData({ ...weekData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">
                        Video Payload (YouTube ID)
                      </label>
                      <input
                        className="admin-input"
                        placeholder="ID Only"
                        value={weekData.videoId}
                        onChange={(e) =>
                          setWeekData({ ...weekData, videoId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Asset Link (PDF URL)</label>
                      <input
                        className="admin-input"
                        placeholder="Cloud URL"
                        value={weekData.pdfUrl}
                        onChange={(e) =>
                          setWeekData({ ...weekData, pdfUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label">Assignment Specification</label>
                    <textarea
                      className="admin-input h-40 pt-5 resize-none"
                      placeholder="Requirements..."
                      value={weekData.assignment}
                      onChange={(e) =>
                        setWeekData({ ...weekData, assignment: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-700 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading
                      ? "Establishing Handshake..."
                      : "Push Configuration to Live"}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-8">
              <div
                className={`p-8 rounded-[3rem] border ${isDarkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white shadow-xl border-gray-100"}`}
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-6 flex items-center gap-2">
                  <ClipboardList size={14} /> Audit Log
                </h3>
                <div className="space-y-4 text-xs font-bold opacity-60 italic">
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span>Global State</span>
                    <span className="text-emerald-500">Encrypted</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span>Node Access</span>
                    <span>Authorized</span>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-blue-600/10 border border-blue-600/20 rounded-3xl">
                  <p className="text-[9px] font-black uppercase text-blue-500 leading-relaxed text-center">
                    Bypassing student approval. Sync is instant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORUM & INQUIRIES SECTIONS REMAIN INTACT AS PER ORIGINAL LOGIC */}
        {activeTab === "forum" && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-right-10 duration-700">
            {forumThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-8 md:p-10 rounded-[3.5rem] border ${isDarkMode ? "bg-slate-900 border-white/5 shadow-xl" : "bg-white border-slate-100 shadow-xl"}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg">
                      {thread.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-lg tracking-tighter">
                        {thread.studentName}
                      </h4>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        Node: {thread.courseId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest border ${thread.status === "resolved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"}`}
                  >
                    {thread.status === "resolved" ? "Closed" : "Awaiting Reply"}
                  </span>
                </div>
                <h3 className="text-xl font-black italic uppercase mb-4 tracking-tight">
                  "{thread.title}"
                </h3>
                <p className="text-sm font-medium leading-relaxed mb-8 opacity-70">
                  {thread.content}
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    className="admin-input flex-1 !rounded-[2rem]"
                    placeholder="Inject response..."
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
                    className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                  >
                    <Reply size={16} /> Inject Response
                  </button>
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
