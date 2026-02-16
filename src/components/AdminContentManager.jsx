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
  LayoutDashboard,
  FileVideo,
  FileText,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  Clock,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  // 1. FETCH DATA (Domin ganin abin da ke ciki idan ka canza Week)
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
        console.error("Fetch Error:", e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [courseId, weekNum]);

  // 2. LOGOUT FUNCTION (Zai tura ka gateway)
  const handleLogout = async (e) => {
    if (e) e.preventDefault(); // Kare redirection
    try {
      await signOut(auth);
      navigate("/admin-gateway");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // 3. SAVE DATA
  const handleCommit = async (e) => {
    e.preventDefault(); // MUHIMMI: Don kada ya kai ka home
    if (!content.title || !content.videoUrl) {
      alert("Please fill the Title and Video ID!");
      return;
    }

    setLoading(true);
    try {
      const releaseDate = content.startDate
        ? new Date(content.startDate)
        : new Date();
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
      alert("SUCCESS: Content Synchronized!");
    } catch (error) {
      alert("Error saving data.");
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE DATA
  const handleDelete = async (e) => {
    e.preventDefault(); // MUHIMMI: Don kada ya kai ka home
    if (window.confirm("Permanently delete this week?")) {
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
        alert("Deleted successfully.");
      } catch (e) {
        alert("Delete failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-[#020617] text-white" : "bg-white text-slate-900"} transition-all duration-300 font-sans`}
    >
      {/* --- SIDEBAR (Kullum a bayyane take a Desktop) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ${isDarkMode ? "bg-slate-900 border-r border-white/10" : "bg-slate-100 border-r border-slate-200"}`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl">
              <ShieldCheck size={28} />
            </div>
            <h1 className="font-black text-xl italic uppercase tracking-tighter">
              Ayax Admin
            </h1>
          </div>

          <nav className="flex-1 space-y-4">
            <div
              className={`flex items-center gap-4 p-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </div>
          </nav>

          <div className="space-y-4 pt-10">
            {/* DARK MODE TOGGLE */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-3 p-5 rounded-3xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? "border-white/10 hover:bg-white/5 text-yellow-500" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
            >
              {isDarkMode ? (
                <>
                  <Sun size={20} /> Light
                </>
              ) : (
                <>
                  <Moon size={20} /> Dark
                </>
              )}
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-5 bg-red-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-16 overflow-y-auto relative">
        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-4 bg-blue-600 rounded-2xl text-white mb-8"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div
          className={`max-w-4xl mx-auto p-10 md:p-16 rounded-[4rem] border ${isDarkMode ? "bg-slate-900/50 border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-xl"}`}
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              Content <span className="text-blue-600 underline">Core</span>
            </h2>
            {loading && (
              <RefreshCcw className="animate-spin text-blue-500" size={32} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-4">
              <label className="admin-label">Target Faculty</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 text-blue-400 border-white/10" : "bg-slate-50 text-blue-600 border-slate-200"}`}
              >
                <option value="web_dev">Web Development</option>
                <option value="cyber_security">Cyber Security</option>
                <option value="software_eng">Software Engineering</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="admin-label">Temporal Week</label>
              <input
                type="number"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 text-amber-500 border-white/10" : "bg-slate-50 text-amber-600 border-slate-200"}`}
              />
            </div>
          </div>

          <form className="space-y-8">
            <div className="space-y-4">
              <label className="admin-label">Lecture Module Title</label>
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="Module Title..."
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="admin-label flex items-center gap-2">
                  <FileVideo size={16} /> YouTube Video ID
                </label>
                <input
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                  placeholder="e.g. dQw4w9WgXcQ"
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div className="space-y-4">
                <label className="admin-label flex items-center gap-2">
                  <FileText size={16} /> PDF Resource URL
                </label>
                <input
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/..."
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="admin-label flex items-center gap-2">
                <Clock size={16} /> Automated Release Time
              </label>
              <input
                type="datetime-local"
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
                className={`admin-input font-black ${isDarkMode ? "bg-slate-800 border-blue-600/30" : "bg-blue-50 border-blue-200 text-blue-600"}`}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-10">
              <button
                onClick={handleCommit}
                disabled={loading}
                className="flex-[2] py-7 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <Save size={24} /> Deploy to Students
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-7 border-2 border-red-600 text-red-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <Trash2 size={24} /> Wipe
              </button>
            </div>
          </form>
        </div>
      </main>

      <style>{`
        .admin-label { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.5; margin-left: 1rem; display: block; }
        .admin-input { width: 100%; padding: 1.5rem 2rem; border-radius: 2.5rem; font-weight: 800; border: 2px solid transparent; outline: none; transition: 0.4s; font-size: 14px; }
        .admin-input:focus { border-color: #2563eb; transform: translateY(-4px); box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.3); }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
