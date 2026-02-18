import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  Users,
  Mail,
  PlusCircle,
  LayoutGrid,
  Moon,
  Sun,
  ShieldAlert,
  Loader2,
  LogOut,
  X,
  Menu,
  ShieldCheck,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students"); // Default tab yanzu dalibai ne

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("admin-theme") === "dark",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [initialSync, setInitialSync] = useState(true);

  // Data States
  const [inquiries, setInquiries] = useState([]);
  const [students, setStudents] = useState([]);

  // 1. DATA SYNC (General Admin Focused)
  useEffect(() => {
    // Sync Inquiries
    const unsubInquiries = onSnapshot(
      query(collection(db, "inquiries"), orderBy("createdAt", "desc")),
      (snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setInitialSync(false);
      },
    );

    // Sync Students (Admitted)
    const unsubStudents = onSnapshot(
      query(
        collection(db, "course_applications"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    return () => {
      unsubInquiries();
      unsubStudents();
    };
  }, []);

  // 2. THEME SYNC
  useEffect(() => {
    localStorage.setItem("admin-theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Admin Session?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  if (initialSync) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs">
          Decrypting Admin Hub...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* SIDEBAR - GENERAL ADMIN ONLY */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-72 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-slate-900 border-r border-white/5" : "bg-white border-r border-gray-200 shadow-2xl"}`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-10 text-blue-600">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} />
              <h1 className="font-black uppercase text-xl italic tracking-tighter">
                AYAX ADMIN
              </h1>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden">
              <X />
            </button>
          </div>

          <nav className="flex-1 space-y-3">
            {[
              {
                id: "students",
                label: "Student Roster",
                icon: <Users size={18} />,
              },
              {
                id: "inquiries",
                label: "Lead Registry",
                icon: <Mail size={18} />,
              },
              {
                id: "grading",
                label: "Grading Center",
                icon: <GraduationCap size={18} />,
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
          </nav>

          <div className="space-y-4 pt-6 border-t border-white/5">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-gray-100 text-slate-600"}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
            >
              <LogOut size={18} /> Logout Terminal
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            {activeTab}{" "}
            <span className="text-blue-600 text-xl md:text-2xl block">
              Management Node
            </span>
          </h1>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-3 bg-blue-600 rounded-xl text-white"
          >
            <Menu />
          </button>
        </header>

        {/* 1. STUDENT ROSTER */}
        {activeTab === "students" && (
          <div className="grid gap-6 animate-in fade-in duration-500">
            {students.map((student) => (
              <div
                key={student.id}
                className={`p-6 rounded-3xl border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100 shadow-sm"} flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                    {student.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">
                      {student.fullName}
                    </h4>
                    <p className="text-[10px] opacity-50 font-bold tracking-widest">
                      {student.course}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full">
                  Admitted
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. LEAD REGISTRY (Inquiries) */}
        {activeTab === "inquiries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-500">
            {inquiries.map((item) => (
              <div
                key={item.id}
                className={`p-8 rounded-[3rem] border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}
              >
                <h4 className="text-2xl font-black italic uppercase mb-2 tracking-tighter">
                  {item.fullName}
                </h4>
                <p className="text-[10px] font-black text-blue-500 mb-6 tracking-wider italic">
                  {item.email}
                </p>
                <p className="text-xs italic font-bold opacity-60">
                  "{item.message}"
                </p>
                <a
                  href={`mailto:${item.email}`}
                  className="block w-full text-center mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-700 transition-all"
                >
                  Reply via Email
                </a>
              </div>
            ))}
          </div>
        )}

        {/* 3. GRADING CENTER */}
        {activeTab === "grading" && (
          <div className="flex flex-col items-center justify-center h-64 opacity-30">
            <GraduationCap size={80} />
            <p className="font-black uppercase text-xs tracking-[0.4em] mt-4">
              Redirecting to Evaluation Node...
            </p>
            <Link
              to="/admin/grading"
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase"
            >
              Access Grading System
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
