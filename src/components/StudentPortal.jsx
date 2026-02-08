import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  onSnapshot,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Lock,
  Award,
  Send,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Layers,
  Users,
  Search,
  Bell,
} from "lucide-react";

// ==========================================
// 1. HELPERS & CONFIGURATION
// ==========================================
const getWeekVideoId = (week) => {
  const videoDatabase = {
    1: "dQw4w9WgXcQ",
    2: "y6120QOlsfU",
    12: "dQw4w9WgXcQ",
    24: "dQw4w9WgXcQ",
  };
  return videoDatabase[week] || "dQw4w9WgXcQ";
};

const getWeekTitle = (week) => {
  const titles = {
    1: "Introduction to System Architecture",
    2: "Environment Setup & Frameworks",
    12: "Midterm Certification Exam",
    24: "Final Project Defense",
  };
  return titles[week] || "Advanced Technical Study Phase";
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
const StudentPortal = () => {
  const navigate = useNavigate();

  // Interface States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Student & Progress States
  const [studentData, setStudentData] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [hasPassedMidterm, setHasPassedMidterm] = useState(false);
  const totalWeeks = 24;

  // Admin Data State
  const [weeksData, setWeeksData] = useState({});

  // Forum & Selection States
  const [viewState, setViewState] = useState("list");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [forumThreads, setForumThreads] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  // --- GYARARREN SUNAYEN COURSES ---
  const availableCourses = [
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
    {
      id: "software_eng",
      name: "Software Engineering",
      icon: <Layers size={20} />,
    },
    {
      id: "ai_tech",
      name: "Artificial Intelligence",
      icon: <Cpu size={20} />, // Idan baka sa Cpu ba, Layers zai zauna
    },
    {
      id: "blockchain",
      name: "Blockchain Technology",
      icon: <Lock size={20} />,
    },
    {
      id: "web_dev",
      name: "Web Development",
      icon: <PlayCircle size={20} />,
    },
    {
      id: "digital_marketing",
      name: "Advanced Digital Marketing",
      icon: <Send size={20} />,
    },
  ];

  // ==========================================
  // 3. CORE LOGIC & EFFECTS
  // ==========================================

  useEffect(() => {
    const unsubWeeks = onSnapshot(
      collection(db, "course_settings"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data();
        });
        setWeeksData(data);
      },
    );
    return () => unsubWeeks();
  }, []);

  useEffect(() => {
    const initPortal = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setStudentData(data);

          const courseStartDate = new Date("2026-01-01");
          const now = new Date();
          const diffTime = now - courseStartDate;
          const weekCount =
            Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
          setCurrentWeek(weekCount > 24 ? 24 : weekCount < 1 ? 1 : weekCount);

          await updateDoc(userRef, {
            lastOnline: serverTimestamp(),
            status: "Active",
            currentActivity: "Browsing Portal",
          });
        }

        const examRef = doc(db, `students/${user.uid}/exams/midterm`);
        const examSnap = await getDoc(examRef);
        if (examSnap.exists() && examSnap.data().status === "passed") {
          setHasPassedMidterm(true);
        }
      } catch (error) {
        console.error("Portal Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initPortal();
  }, [navigate]);

  const isWeekLocked = (weekNumber) => {
    const weekSettings = weeksData[`week_${weekNumber}`];
    if (!weekSettings || !weekSettings.releaseDate) return true;
    const releaseDate = new Date(weekSettings.releaseDate.seconds * 1000);
    const today = new Date();
    const isDateReached = today >= releaseDate;
    const isMidtermLocked = weekNumber > 12 && !hasPassedMidterm;
    return !isDateReached || isMidtermLocked;
  };

  useEffect(() => {
    if (
      activeTab === "discussions" &&
      viewState === "forum" &&
      selectedCourse &&
      selectedPath
    ) {
      const q = query(
        collection(db, "forum_threads"),
        where("courseId", "==", selectedCourse.id),
        where("studentType", "==", selectedPath),
        orderBy("createdAt", "desc"),
      );
      const unsub = onSnapshot(q, (snap) => {
        setForumThreads(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
      return () => unsub();
    }
  }, [activeTab, viewState, selectedCourse, selectedPath]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const markWeekAsCompleted = async (weekNumber) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`progress.week_${weekNumber}`]: {
          completed: true,
          completedAt: serverTimestamp(),
        },
      });
      alert(`SUCCESS: Week ${weekNumber} verified.`);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    try {
      await addDoc(collection(db, "forum_threads"), {
        ...newPost,
        studentName: studentData.fullName,
        studentId: auth.currentUser.uid,
        courseId: selectedCourse.id,
        studentType: selectedPath,
        createdAt: serverTimestamp(),
      });
      setNewPost({ title: "", content: "" });
    } catch (err) {
      alert("Error: Transmission failed.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-blue-600 bg-slate-950">
        INITIALIZING SYSTEMS...
      </div>
    );

  return (
    <div
      className={`min-h-screen flex font-sans selection:bg-blue-600 selection:text-white ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"} transition-colors duration-300`}
    >
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-72 md:w-80 border-r flex flex-col transition-transform duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 md:p-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-blue-600 italic">
              AYAX{" "}
              <span className={darkMode ? "text-white" : "text-gray-900"}>
                UNI
              </span>
            </h1>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
              LMS Terminal v3.0
            </p>
          </div>
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 md:px-6 space-y-1 md:space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {[
            {
              id: "dashboard",
              name: "Dashboard",
              icon: <LayoutDashboard size={18} />,
            },
            { id: "courses", name: "Curriculum", icon: <BookOpen size={18} /> },
            {
              id: "discussions",
              name: "Community Forum",
              icon: <MessageSquare size={18} />,
            },
            {
              id: "grades",
              name: "Performance",
              icon: <GraduationCap size={18} />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setViewState("list");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-blue-50/10"}`}
            >
              {item.icon} {item.name}
            </button>
          ))}

          <div className="mt-8 mb-2 px-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">
            24-Week Roadmap
          </div>
          <div className="space-y-1 pb-10">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const isLocked = isWeekLocked(week);
              return (
                <div
                  key={week}
                  onClick={() => !isLocked && setCurrentWeek(week)}
                  className={`flex items-center justify-between px-4 py-2 md:py-3 rounded-xl transition-all ${isLocked ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-blue-50/10 cursor-pointer group"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center text-[8px] md:text-[9px] font-black ${isLocked ? "bg-gray-200 text-gray-400" : "bg-blue-100 text-blue-600"}`}
                    >
                      {week}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase">
                      Week {week}
                    </span>
                  </div>
                  {isLocked ? (
                    <Lock size={10} />
                  ) : (
                    <ChevronRight
                      size={10}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 md:p-6 border-t dark:border-slate-800 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-gray-100 text-slate-600"}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}{" "}
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
        <header className="lg:hidden flex justify-between items-center mb-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 bg-blue-600 text-white rounded-lg shadow-lg"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xs font-black italic tracking-tighter">
            AYAX PORTAL
          </h2>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">
            {studentData?.fullName?.charAt(0)}
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
            <div className="bg-blue-600 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <Award className="absolute -right-10 -bottom-10 w-40 h-40 md:w-64 md:h-64 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-6xl font-black italic tracking-tighter mb-2 md:mb-4 uppercase">
                  Academic Status
                </h2>
                <p className="text-[10px] md:text-lg font-bold opacity-80 max-w-xl leading-relaxed">
                  Welcome, {studentData?.fullName}. Active at Week {currentWeek}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
              {[
                {
                  label: "Completion",
                  val: `${Math.round((currentWeek / 24) * 100)}%`,
                  color: "text-blue-600",
                },
                {
                  label: "Current Week",
                  val: `W-${currentWeek}`,
                  color: "text-emerald-500",
                },
                {
                  label: "Midterm",
                  val: hasPassedMidterm ? "PASS" : "PEND",
                  color: hasPassedMidterm ? "text-blue-500" : "text-orange-500",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
                >
                  <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <h4
                    className={`text-xl md:text-4xl font-black italic ${stat.color}`}
                  >
                    {stat.val}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-black aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/5">
                {weeksData[`week_${currentWeek}`]?.videoId ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${weeksData[`week_${currentWeek}`].videoId}`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-white font-black opacity-20 uppercase tracking-widest text-[10px]">
                    Video Pending...
                  </div>
                )}
              </div>
              <div
                className={`p-6 md:p-10 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
              >
                <h3 className="text-xl md:text-3xl font-black uppercase italic mb-4 tracking-tighter">
                  Week {currentWeek}: {getWeekTitle(currentWeek)}
                </h3>
                <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6">
                  <h5 className="text-[8px] font-black text-blue-600 uppercase mb-2 tracking-[0.2em]">
                    Assignment
                  </h5>
                  <p className="text-[11px] md:text-sm font-bold opacity-80 leading-relaxed">
                    {weeksData[`week_${currentWeek}`]?.assignment ||
                      "No specific instructions provided."}
                  </p>
                </div>
                <button
                  onClick={() => markWeekAsCompleted(currentWeek)}
                  className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-3"
                >
                  <CheckCircle size={16} /> Mark Completed
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                Up Next
              </h3>
              {[currentWeek, currentWeek + 1, currentWeek + 2].map(
                (w) =>
                  w <= 24 && (
                    <div
                      key={w}
                      className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"} flex items-center gap-4`}
                    >
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px]">
                        {w}
                      </div>
                      <p className="text-[9px] font-black uppercase truncate">
                        {getWeekTitle(w)}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {activeTab === "discussions" && (
          <div className="animate-in fade-in duration-700">
            {viewState === "list" && (
              <div className="space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
                    Repositories
                  </h2>
                  <p className="text-gray-400 font-bold uppercase text-[8px] tracking-widest">
                    Select module to enter forum.
                  </p>
                </div>
                {/* --- DISPLAYING THE NEW LIST OF COURSES --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setViewState("selection");
                      }}
                      className={`p-6 md:p-10 rounded-[2.5rem] border cursor-pointer group transition-all ${darkMode ? "bg-slate-900 border-slate-800 hover:border-blue-600" : "bg-white border-gray-100 hover:border-blue-600 shadow-sm"}`}
                    >
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        {course.icon}
                      </div>
                      <h4 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter mb-1">
                        {course.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[8px] font-black text-blue-500 uppercase">
                        Enter Repo <ChevronRight size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewState === "selection" && (
              <div className="max-w-4xl mx-auto py-10 md:py-20 text-center">
                <h3 className="text-2xl md:text-4xl font-black uppercase italic mb-8">
                  Registry Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                  <div
                    onClick={() => {
                      setSelectedPath("Path 1");
                      setViewState("forum");
                    }}
                    className="p-8 md:p-12 bg-blue-600 text-white rounded-[2.5rem] md:rounded-[4rem] cursor-pointer shadow-xl"
                  >
                    <Users size={32} className="mx-auto mb-4" />
                    <h4 className="text-xl md:text-3xl font-black italic uppercase">
                      Path 1
                    </h4>
                    <p className="text-[8px] font-black uppercase opacity-70 mt-1">
                      New Students
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedPath("Path 2");
                      setViewState("forum");
                    }}
                    className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed cursor-pointer ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}
                  >
                    <ShieldCheck
                      size={32}
                      className="mx-auto mb-4 text-blue-600"
                    />
                    <h4 className="text-xl md:text-3xl font-black italic uppercase">
                      Path 2
                    </h4>
                    <p className="text-[8px] font-black uppercase text-gray-400 mt-1">
                      Returning
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewState === "forum" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
                <div className="lg:col-span-1">
                  <div
                    className={`p-6 md:p-10 rounded-[2.5rem] border sticky top-4 ${darkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}
                  >
                    <h4 className="font-black uppercase text-[10px] text-blue-500 mb-6">
                      New Inquiry
                    </h4>
                    <form onSubmit={handlePostQuestion} className="space-y-3">
                      <input
                        className="s-input dark:bg-slate-800"
                        placeholder="SUBJECT"
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({ ...newPost, title: e.target.value })
                        }
                      />
                      <textarea
                        className="s-input dark:bg-slate-800 h-32 md:h-40 pt-4"
                        placeholder="DETAILS..."
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                      />
                      <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2">
                        <Send size={14} /> Dispatch
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4 md:space-y-8">
                  {forumThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-50 shadow-sm"}`}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                          {thread.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase">
                            {thread.studentName}
                          </p>
                          <p className="text-[8px] font-bold text-gray-400">
                            {new Date(
                              thread.createdAt?.seconds * 1000,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <h4 className="text-lg md:text-2xl font-black italic uppercase mb-3">
                        {thread.title}
                      </h4>
                      <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                        {thread.content}
                      </p>
                      <button
                        onClick={() => navigate(`/forum/thread/${thread.id}`)}
                        className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-2"
                      >
                        View Discussion <ChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .s-input { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 800; font-size: 0.75rem; outline: none; transition: 0.3s; }
        .s-input:focus { border-color: #2563eb; background: white; }
        .dark .s-input { background: #1e293b; color: white; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb33; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentPortal;