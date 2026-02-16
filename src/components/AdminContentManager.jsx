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

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin-gateway");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Reference helper
  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  // Fetch existing data when course or week changes
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

      alert(`SYNCHRONIZED: Module Week ${weekNum} is now live/scheduled.`);
    } catch (error) {
      alert("DATABASE ERROR: Sync failed.");
    } finally {
      setLoading(false);
    }
  };

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
        alert("WIPED: Content removed successfully.");
      } catch (e) {
        alert("ERROR: Could not delete.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"} transition-colors duration-300 font-sans`}
    >
      {/* --- SIDEBAR MENU --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ${isDarkMode ? "bg-slate-900 border-r border-slate-800" : "bg-white border-r border-slate-200 shadow-xl"}`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <h1 className="font-black uppercase tracking-tighter text-xl italic">
              AYAX Admin
            </h1>
          </div>

          <nav className="space-y-2">
            <button
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${isDarkMode ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" : "bg-blue-50 text-blue-600"}`}
            >
              <LayoutDashboard size={18} /> Content Manager
            </button>
            {/* Add more nav items here */}
          </nav>
        </div>

        <div className="absolute bottom-6 w-full px-6 space-y-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs uppercase tracking-widest ${isDarkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"}`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}{" "}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-blue-600 rounded-lg text-white"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-black italic uppercase">Ayax Academy</h2>
        </header>

        <div
          className={`max-w-4xl mx-auto p-8 md:p-12 rounded-[3rem] border transition-all ${isDarkMode ? "bg-slate-900/50 border-slate-800 shadow-2xl" : "bg-white border-slate-100 shadow-xl"}`}
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                Content Core
              </h2>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.3em] mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Module Synchronization & Scheduling
              </p>
            </div>
            {loading && <RefreshCcw className="animate-spin text-blue-500" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="admin-label">Target Faculty</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              >
                <option value="web_dev">Web Development</option>
                <option value="cyber_security">Cyber Security</option>
                <option value="software_eng">Software Engineering</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="admin-label">Module Week</label>
              <input
                type="number"
                min="1"
                max="24"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                className={`admin-input text-amber-500 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="admin-label">Lecture Title</label>
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="Title of the lesson..."
                className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileVideo size={14} /> Video ID (YouTube)
                </label>
                <input
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                  placeholder="e.g. dQw4w9WgXcQ"
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <FileText size={14} /> PDF Resource Link
                </label>
                <input
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                  placeholder="Direct Link to PDF"
                  className={`admin-input ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="admin-label flex items-center gap-2 text-blue-500">
                <Clock size={14} /> Auto-Release Schedule
              </label>
              <input
                type="datetime-local"
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
                className={`admin-input border-blue-500/30 ${isDarkMode ? "bg-slate-800" : "bg-blue-50/50"}`}
              />
            </div>

            <div className="space-y-3">
              <label className="admin-label">Assignment Instruction</label>
              <textarea
                value={content.assignment}
                onChange={(e) =>
                  setContent({ ...content, assignment: e.target.value })
                }
                className={`admin-input h-32 resize-none ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-12">
            <button
              onClick={handleCommit}
              disabled={loading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Save size={18} /> Deploy Content
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 border-2 border-red-600 text-red-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all"
            >
              <Trash2 size={18} /> Wipe
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .admin-label {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-left: 0.5rem;
          opacity: 0.6;
        }
        .admin-input {
          width: 100%;
          padding: 1.25rem;
          border-radius: 1.5rem;
          font-weight: 700;
          outline: none;
          border: 2px solid transparent;
          transition: 0.3s;
        }
        .admin-input:focus {
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
