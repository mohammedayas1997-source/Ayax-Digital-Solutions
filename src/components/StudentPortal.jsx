import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  PlayCircle,
  CheckCircle,
  Lock,
  Award,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  Download,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Search,
  Layers,
  Cpu,
  Globe,
} from "lucide-react";

const StudentPortal = () => {
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [studentData, setStudentData] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [courseContent, setCourseContent] = useState({});

  const availableCourses = [
    {
      id: "software_eng",
      name: "Software Engineering",
      icon: <Layers size={20} />,
    },
    {
      id: "cyber_security",
      name: "Cyber Security",
      icon: <ShieldCheck size={20} />,
    },
    {
      id: "data_analytics",
      name: "Data Analytics",
      icon: <Search size={20} />,
    },
    { id: "ai_tech", name: "Artificial Intelligence", icon: <Cpu size={20} /> },
    { id: "web_dev", name: "Web Development", icon: <Globe size={20} /> },
  ];

  // --- 1. Auth & Initial Data Fetch ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setStudentData(data);
        if (data.selectedCourse) {
          setSelectedCourseId(data.selectedCourse);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- 2. Real-time Content Fetch (Admin Controlled) ---
  useEffect(() => {
    if (selectedCourseId) {
      // Listen to specific course content managed by Admin
      const contentRef = collection(db, "courses", selectedCourseId, "weeks");
      const unsubContent = onSnapshot(contentRef, (snapshot) => {
        const weeks = {};
        snapshot.forEach((doc) => {
          weeks[doc.id] = doc.data(); // doc.id is 'week_1', 'week_2', etc.
        });
        setCourseContent(weeks);
      });
      return () => unsubContent();
    }
  }, [selectedCourseId]);

  // --- 3. Actions ---
  const handleCourseSelection = async (courseId) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        selectedCourse: courseId,
        courseJoinedAt: serverTimestamp(),
      });
      setSelectedCourseId(courseId);
    }
  };

  const markCompleted = async (weekId) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`progress.${selectedCourseId}.${weekId}`]: true,
      });
      alert("System: Progress Synchronized.");
    }
  };

  // --- Helper: Check if week is locked ---
  const isLocked = (weekNum) => {
    const weekKey = `week_${weekNum}`;
    const data = courseContent[weekKey];
    if (!data) return true; // If admin hasn't added it, it's locked
    if (data.isLocked) return true; // Direct admin toggle
    return false;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black">
        LOADING CORE SYSTEMS...
      </div>
    );

  // --- SCREEN A: Course Selection (If no course selected) ---
  if (!selectedCourseId) {
    return (
      <div
        className={`min-h-screen p-6 md:p-20 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-black"}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black italic mb-4">
            SELECT YOUR PATH
          </h1>
          <p className="text-gray-500 mb-12 uppercase tracking-widest text-xs">
            Choose a specialization to initialize your dashboard
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelection(course.id)}
                className="p-10 border-2 border-dashed border-slate-800 rounded-[2rem] hover:border-blue-600 hover:bg-blue-600/5 transition-all cursor-pointer group text-left"
              >
                <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  {course.icon}
                </div>
                <h3 className="text-2xl font-black uppercase italic">
                  {course.name}
                </h3>
                <p className="text-[10px] text-gray-500 mt-2">
                  Click to register and access curriculum
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN B: Main Dashboard ---
  const currentWeekData = courseContent[`week_${currentWeek}`] || {};

  return (
    <div
      className={`min-h-screen flex ${darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}
    >
      {/* Sidebar */}
      <aside
        className={`w-72 border-r ${darkMode ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200"} hidden lg:flex flex-col`}
      >
        <div className="p-8">
          <h2 className="text-2xl font-black italic text-blue-600">AYAX UNI</h2>
          <span className="text-[8px] tracking-[0.3em] text-gray-500 uppercase">
            {selectedCourseId.replace("_", " ")}
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {["dashboard", "curriculum", "community"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
            >
              {t === "dashboard" && <LayoutDashboard size={18} />}
              {t === "curriculum" && <BookOpen size={18} />}
              {t === "community" && <MessageSquare size={18} />}
              {t}
            </button>
          ))}

          <div className="pt-8 pb-2 px-6 text-[8px] font-black text-gray-500 uppercase tracking-widest">
            Syllabus Progress
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              disabled={isLocked(w)}
              onClick={() => {
                setCurrentWeek(w);
                setActiveTab("curriculum");
              }}
              className={`w-full flex items-center justify-between px-6 py-3 rounded-xl transition-all ${currentWeek === w ? "bg-blue-600/20 text-blue-500" : "text-gray-500"} ${isLocked(w) ? "opacity-20 cursor-not-allowed" : "hover:bg-white/5"}`}
            >
              <span className="text-[10px] font-black uppercase">Week {w}</span>
              {isLocked(w) ? <Lock size={12} /> : <ChevronRight size={12} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full py-3 text-[10px] font-black uppercase bg-slate-800 rounded-xl mb-2"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => signOut(auth)}
            className="w-full py-3 text-[10px] font-black uppercase bg-red-600/10 text-red-500 rounded-xl"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-blue-600 p-12 rounded-[3rem] mb-10 relative overflow-hidden">
              <Award className="absolute right-0 bottom-0 size-48 opacity-10 rotate-12" />
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                Welcome Back
              </h1>
              <p className="font-bold opacity-80 uppercase text-sm tracking-widest">
                {studentData?.fullName} | {selectedCourseId.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-2">
                  Active Week
                </p>
                <h3 className="text-4xl font-black italic">W-{currentWeek}</h3>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-2">
                  Completion
                </p>
                <h3 className="text-4xl font-black italic text-blue-500">
                  12%
                </h3>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-2">
                  Community Rank
                </p>
                <h3 className="text-4xl font-black italic text-emerald-500">
                  Elite
                </h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tight">
                Week {currentWeek}:{" "}
                {currentWeekData.title || "Module Loading..."}
              </h2>
              <p className="text-gray-500 text-xs uppercase font-bold mt-1">
                Admin Controlled Content
              </p>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border-4 border-slate-900 shadow-2xl mb-10">
              {currentWeekData.videoUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={currentWeekData.videoUrl.replace("watch?v=", "embed/")}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                  <PlayCircle size={64} className="mb-4 opacity-10" />
                  <p className="font-black text-[10px] uppercase tracking-widest">
                    No Video Uploaded for this Week
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PDF Section */}
              <div className="p-8 bg-blue-600 rounded-[2rem] text-white">
                <FileText className="mb-4" />
                <h4 className="text-xl font-black uppercase italic mb-2">
                  Resources
                </h4>
                {currentWeekData.pdfUrl ? (
                  <a
                    href={currentWeekData.pdfUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase"
                  >
                    <Download size={14} /> Download PDF Material
                  </a>
                ) : (
                  <p className="text-[10px] font-black opacity-50 uppercase">
                    No PDF materials linked yet.
                  </p>
                )}
              </div>

              {/* Assignment Section */}
              <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800">
                <Calendar className="text-blue-500 mb-4" />
                <h4 className="text-xl font-black uppercase italic mb-2">
                  Assignment
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {currentWeekData.assignment ||
                    "Check back soon for this week's task."}
                </p>
                <button
                  onClick={() => markCompleted(`week_${currentWeek}`)}
                  className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase"
                >
                  <CheckCircle size={14} /> Mark as Finished
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;
