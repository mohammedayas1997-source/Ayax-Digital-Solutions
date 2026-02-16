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
  Clock,
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

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin-gateway");
    } catch (error) {
      console.error(error);
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

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"} transition-all duration-300`}
    >
      {/* --- SIDEBAR MENU (Fixed Visibility) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-slate-900 border-r border-white/10" : "bg-white border-r border-slate-200 shadow-2xl"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-black uppercase text-xl italic">
                AYAX Admin
              </h1>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden">
              <X />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              to="/admin-dashboard"
              className="nav-item bg-blue-600 text-white"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            {/* WADANNAN BUTTONS DIN YANZU ZA SU YI AIKI SABODA GYARAN PROTECTED ROUTE */}
            <Link to="/admin/grading" className="nav-item hover:bg-blue-600/10">
              <GraduationCap size={18} /> Student Grading
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
              <Users size={18} /> Students List
            </Link>
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-white/10 font-bold uppercase text-[10px] tracking-widest"
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
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="md:hidden flex items-center justify-between mb-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-blue-600 rounded-xl text-white"
          >
            <Menu />
          </button>
          <h2 className="font-black italic uppercase text-blue-600">
            Ayax Academy
          </h2>
        </header>

        <div
          className={`max-w-4xl mx-auto p-8 md:p-12 rounded-[3rem] border ${isDarkMode ? "bg-slate-900/40 border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-lg"}`}
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              Content <span className="text-blue-600">Manager</span>
            </h2>
            {loading && <RefreshCcw className="animate-spin text-blue-500" />}
          </div>

          {/* INPUT FIELDS (Kamar yadda suke a baya, amma an kara styles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-50 ml-2">
                Course Stream
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="admin-input"
              >
                <option value="web_dev">Web Development</option>
                <option value="software_eng">Software Engineering</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-50 ml-2">
                Week Number
              </label>
              <input
                type="number"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="space-y-6">
            <input
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
              placeholder="Lesson Title"
              className="admin-input"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                value={content.videoUrl}
                onChange={(e) =>
                  setContent({ ...content, videoUrl: e.target.value })
                }
                placeholder="YouTube Video ID"
                className="admin-input"
              />
              <input
                value={content.pdfUrl}
                onChange={(e) =>
                  setContent({ ...content, pdfUrl: e.target.value })
                }
                placeholder="PDF URL"
                className="admin-input"
              />
            </div>
            <input
              type="datetime-local"
              value={content.startDate}
              onChange={(e) =>
                setContent({ ...content, startDate: e.target.value })
              }
              className="admin-input border-blue-500/50"
            />

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {}}
                className="flex-1 bg-blue-600 p-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2"
              >
                <Save size={18} /> Deploy Module
              </button>
              <button
                onClick={() => {}}
                className="p-5 border-2 border-red-600 text-red-600 rounded-2xl font-black uppercase text-xs"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; transition: 0.3s; }
        .admin-input { width: 100%; padding: 18px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-weight: 700; outline: none; }
        .admin-input:focus { border-color: #2563eb; }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
