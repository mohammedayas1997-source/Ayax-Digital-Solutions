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
import { useNavigate, Link } from "react-router-dom";
import {
  Trash2,
  Save,
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
  GraduationCap,
  Database,
  Users,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // --- LOGOUT (Gyara: Yanzu zai yi aiki) ---
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await signOut(auth);
        navigate("/admin-gateway");
      } catch (error) {
        console.error(error);
      }
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchContent = async () => {
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
    fetchContent();
  }, [courseId, weekNum]);

  // --- SAVE DATA (Gyara: Yanzu zai yi aiki) ---
  const handleSave = async (e) => {
    e.preventDefault(); // Don kada ya mayar da kai home
    if (!content.title || !content.videoUrl) {
      alert("Please fill Title and Video URL!");
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
      alert("SUCCESS: Module Deployed!");
    } catch (err) {
      alert("Database error!");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE DATA (Gyara: Yanzu zai yi aiki) ---
  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm("Delete this module permanently?")) {
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
        alert("Wiped successfully.");
      } catch (err) {
        alert("Delete failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"} transition-all duration-300 font-sans`}
    >
      {/* --- SIDEBAR MENU --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-slate-900 border-r border-white/10" : "bg-white border-r border-slate-200 shadow-2xl"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-black uppercase text-xl italic tracking-tighter text-blue-600">
                AYAX Admin
              </h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-2 hover:bg-red-500/10 rounded-full text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              to="/admin-dashboard"
              className="nav-item bg-blue-600/10 text-blue-500 border border-blue-600/20"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/admin/grading" className="nav-item hover:bg-blue-600/10">
              <GraduationCap size={18} /> Grading
            </Link>
            <Link
              to="/admin/questions"
              className="nav-item hover:bg-blue-600/10"
            >
              <Database size={18} /> Question Bank
            </Link>
            <Link
              to="/admin/students/all"
              className="nav-item hover:bg-blue-600/10"
            >
              <Users size={18} /> Students
            </Link>
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border font-bold uppercase text-[10px] tracking-widest ${isDarkMode ? "border-white/10 text-yellow-500" : "border-slate-200 text-slate-600"}`}
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
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        <header className="md:hidden flex items-center justify-between mb-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-blue-600 rounded-xl text-white shadow-lg"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-black italic uppercase text-blue-600 tracking-tighter">
            Ayax Academy
          </h2>
        </header>

        <div
          className={`max-w-4xl mx-auto p-8 md:p-14 rounded-[3.5rem] border transition-all duration-500 ${isDarkMode ? "bg-slate-900/40 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]" : "bg-white border-slate-100 shadow-xl"}`}
        >
          <div className="flex justify-between items-center mb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="admin-label">Target Faculty</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 text-blue-400 border-white/5" : "bg-slate-50 text-blue-600 border-slate-200"}`}
              >
                <option value="web_dev">Web Development</option>
                <option value="software_eng">Software Engineering</option>
                <option value="cyber_security">Cyber Security</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="admin-label">Module Week (1-24)</label>
              <input
                type="number"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 text-amber-500 border-white/5" : "bg-slate-50 text-amber-600 border-slate-200"}`}
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
                placeholder="e.g. Mastering Tailwind CSS"
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/5" : "bg-slate-50 border-slate-200"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileVideo size={14} className="text-red-500" /> Video ID
                  (YouTube)
                </label>
                <input
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                  placeholder="YouTube ID Only"
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/5" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" /> Cloud PDF
                  Link
                </label>
                <input
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/..."
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-white/5" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="admin-label text-blue-500">
                Scheduled Release Time
              </label>
              <input
                type="datetime-local"
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
                className={`admin-input font-black ${isDarkMode ? "bg-slate-800 border-blue-600/20" : "bg-blue-50 border-blue-200"}`}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-10">
              <button
                onClick={handleSave}
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
        </div>
      </main>

      <style>{`
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 18px; border-radius: 20px; font-weight: 900; font-size: 11px; text-transform: uppercase; transition: 0.3s; letter-spacing: 0.1em; }
        .admin-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-left: 1rem; opacity: 0.5; }
        .admin-input { width: 100%; padding: 1.5rem; border-radius: 2rem; font-weight: 800; border: 2px solid transparent; outline: none; transition: 0.3s; font-size: 13px; }
        .admin-input:focus { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.2); }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
