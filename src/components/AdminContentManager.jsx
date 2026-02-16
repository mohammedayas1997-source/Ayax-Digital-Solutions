import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Save,
  AlertCircle,
  RefreshCcw,
  Calendar,
  Clock,
  LayoutDashboard,
  FileVideo,
  FileText,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile Menu State
  const [loading, setLoading] = useState(false);

  // State for content management
  const [courseId, setCourseId] = useState("web_dev");
  const [weekNum, setWeekNum] = useState(1);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    startDate: "",
  });

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        navigate("/admin-gateway");
      } catch (error) {
        console.error("Logout Error:", error);
      }
    }
  };

  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCurrentContent = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(getDocRef());
        if (snap.exists()) {
          const data = snap.data();
          setContent({
            ...data,
            startDate: data.startDate?.toDate
              ? data.startDate.toDate().toISOString().slice(0, 16)
              : data.startDate || "",
          });
        } else {
          setContent({
            title: "",
            videoUrl: "",
            pdfUrl: "",
            assignment: "",
            startDate: "",
          });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [courseId, weekNum]);

  // --- SAVE DATA ---
  const handleCommit = async () => {
    if (!content.title || !content.videoUrl || !content.startDate) {
      alert("MANDATORY: Title, Video, and Release Date are required!");
      return;
    }

    setLoading(true);
    try {
      const releaseDate = new Date(content.startDate);
      await setDoc(
        getDocRef(),
        {
          ...content,
          startDate: releaseDate,
          weekNumber: Number(weekNum),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert(`SYNCHRONIZED: Week ${weekNum} is now updated.`);
    } catch (error) {
      alert("DATABASE ERROR: Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE DATA ---
  const handleDelete = async () => {
    if (window.confirm(`DANGER: Delete Week ${weekNum} permanently?`)) {
      setLoading(true);
      try {
        await deleteDoc(getDocRef());
        setContent({
          title: "",
          videoUrl: "",
          pdfUrl: "",
          assignment: "",
          startDate: "",
        });
        alert("WIPED: Deleted successfully.");
      } catch (e) {
        alert("ERROR: Could not delete.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"} transition-all duration-500 font-sans`}
    >
      {/* --- SIDEBAR / MENU --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-slate-900 border-r border-slate-800" : "bg-white border-r border-slate-200 shadow-2xl"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/20">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-black uppercase tracking-tighter text-xl italic">
                AYAX Admin
              </h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-3">
            <button
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isDarkMode ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-blue-600 text-white"}`}
            >
              <LayoutDashboard size={18} /> Content Manager
            </button>
            {/* Zaka iya kara wasu buttons din a nan */}
          </nav>

          <div className="pt-6 border-t border-slate-800 space-y-4">
            {/* DARK MODE TOGGLE */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${isDarkMode ? "border-slate-800 hover:bg-slate-800 text-yellow-500" : "border-slate-100 hover:bg-slate-50 text-slate-600"}`}
            >
              {isDarkMode ? (
                <>
                  <Sun size={18} /> Light Mode
                </>
              ) : (
                <>
                  <Moon size={18} /> Dark Mode
                </>
              )}
            </button>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20"
            >
              <LogOut size={18} /> Logout System
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-12 relative">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-blue-600 rounded-xl text-white"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-black italic uppercase text-blue-600">
            Ayax Academy
          </h2>
        </div>

        <div
          className={`max-w-4xl mx-auto p-8 md:p-14 rounded-[3.5rem] border transition-all duration-500 ${isDarkMode ? "bg-slate-900/40 border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]" : "bg-white border-slate-100 shadow-xl"}`}
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                Content <span className="text-blue-600">Core</span>
              </h2>
              <div className="h-1.5 w-20 bg-blue-600 mt-3 rounded-full"></div>
            </div>
            {loading && (
              <RefreshCcw className="animate-spin text-blue-500" size={32} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-3">
              <label className="admin-label">Target Faculty</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-600"}`}
              >
                <option value="web_dev">Web Development</option>
                <option value="cyber_security">Cyber Security</option>
                <option value="software_eng">Software Engineering</option>
                <option value="ai_tech">Artificial Intelligence</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="admin-label">Module Week (1-24)</label>
              <input
                type="number"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700 text-amber-500" : "bg-slate-50 border-slate-200 text-amber-600"}`}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="admin-label">Lecture Module Title</label>
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="e.g. Introduction to React Hooks"
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileVideo size={14} className="text-red-500" /> YouTube Video
                  ID
                </label>
                <input
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                  placeholder="ID kadai (e.g. dQw4w9WgXcQ)"
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" /> Cloud PDF URL
                </label>
                <input
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/..."
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="admin-label flex items-center gap-2 text-blue-500">
                <Clock size={16} /> Automated Release Time
              </label>
              <input
                type="datetime-local"
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
                className={`admin-input border-blue-500/30 font-black ${isDarkMode ? "bg-slate-800" : "bg-blue-50/50"}`}
              />
            </div>

            <div className="space-y-3">
              <label className="admin-label">Assignment Brief</label>
              <textarea
                value={content.assignment}
                onChange={(e) =>
                  setContent({ ...content, assignment: e.target.value })
                }
                className={`admin-input h-40 resize-none ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mt-14">
            <button
              onClick={handleCommit}
              disabled={loading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Save size={20} /> Deploy Module
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`flex-1 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 border-2 ${isDarkMode ? "border-red-900/50 text-red-500 hover:bg-red-600 hover:text-white" : "border-red-100 text-red-500 hover:bg-red-600 hover:text-white"}`}
            >
              <Trash2 size={20} /> Wipe
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .admin-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-left: 0.8rem; opacity: 0.5; }
        .admin-input { width: 100%; padding: 1.5rem; border-radius: 1.8rem; font-weight: 700; outline: none; border: 2px solid transparent; transition: 0.3s; font-size: 13px; }
        .admin-input:focus { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.2); }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
