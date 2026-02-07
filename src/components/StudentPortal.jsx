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
import { useNavigate } from "react-router-dom"; // Wannan shi ne zai ba ka damar tafiya ForumDetails
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

  // Forum & Selection States
  const [viewState, setViewState] = useState("list"); // list, selection, forum
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null); // Path 1: New, Path 2: Old
  const [forumThreads, setForumThreads] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  const availableCourses = [
    {
      id: "software_eng",
      name: "Software Engineering",
      icon: <Layers size={20} />,
    },
    {
      id: "data_science",
      name: "Data Science & AI",
      icon: <Layers size={20} />,
    },
    { id: "cyber_sec", name: "Cybersecurity Ops", icon: <Layers size={20} /> },
  ];

  // ==========================================
  // 3. CORE LOGIC & EFFECTS
  // ==========================================
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

          // Calculate Week Progress based on Start Date
          const courseStartDate = new Date("2026-01-01");
          const now = new Date();
          const diffTime = now - courseStartDate;
          const weekCount =
            Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
          setCurrentWeek(weekCount > 24 ? 24 : weekCount < 1 ? 1 : weekCount);

          // Real-time Update for Admin
          await updateDoc(userRef, {
            lastOnline: serverTimestamp(),
            status: "Active",
            currentActivity: "Browsing Portal",
          });
        }

        // Check Midterm Status
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

  // Forum Real-time Sync
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

  // ==========================================
  // 4. ACTION HANDLERS
  // ==========================================
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
      <div className="min-h-screen flex items-center justify-center font-black">
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
        className={`fixed lg:sticky top-0 z-50 h-screen w-80 border-r flex flex-col transition-transform duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-10">
          <h1 className="text-2xl font-black text-blue-600 italic">
            AYAX{" "}
            <span className={darkMode ? "text-white" : "text-gray-900"}>
              UNI
            </span>
          </h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
            LMS Terminal v3.0
          </p>
        </div>

        <nav className="px-6 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
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
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-xl" : "text-gray-400 hover:bg-blue-50/10"}`}
            >
              {item.icon} {item.name}
            </button>
          ))}

          <div className="mt-10 mb-4 px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">
            24-Week Roadmap
          </div>
          <div className="space-y-1 pb-10">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const isLocked =
                week > currentWeek || (week > 12 && !hasPassedMidterm);
              return (
                <div
                  key={week}
                  className={`flex items-center justify-between px-6 py-3 rounded-xl transition-all ${isLocked ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-blue-50/10 cursor-pointer group"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${isLocked ? "bg-gray-200 text-gray-400" : "bg-blue-100 text-blue-600"}`}
                    >
                      {week}
                    </div>
                    <span className="text-[10px] font-black uppercase">
                      Week {week}
                    </span>
                  </div>
                  {isLocked ? (
                    <Lock size={12} />
                  ) : (
                    <ChevronRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-6 border-t dark:border-slate-800 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-gray-100 text-slate-600"}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-14 overflow-y-auto">
        {/* Mobile Header Top */}
        <header className="lg:hidden flex justify-between items-center mb-10">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-xl"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-black italic">ACADEMIC CORE</h2>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
            {studentData?.fullName?.charAt(0)}
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-blue-600 p-10 lg:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <Award className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter mb-4 uppercase">
                  Academic Status
                </h2>
                <p className="text-sm lg:text-lg font-bold opacity-80 max-w-xl">
                  Welcome back, {studentData?.fullName}. You are currently at
                  Week {currentWeek} of the 24-week curriculum.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Completion Rate
                </p>
                <h4 className="text-4xl font-black italic text-blue-600">
                  {Math.round((currentWeek / 24) * 100)}%
                </h4>
              </div>
              <div
                className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Current Phase
                </p>
                <h4 className="text-4xl font-black italic text-emerald-500 uppercase">
                  WEEK {currentWeek}
                </h4>
              </div>
              <div
                className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Midterm Status
                </p>
                <h4
                  className={`text-4xl font-black italic ${hasPassedMidterm ? "text-blue-500" : "text-orange-500"}`}
                >
                  {hasPassedMidterm ? "PASSED" : "PENDING"}
                </h4>
              </div>
            </div>

            {currentWeek >= 12 && !hasPassedMidterm && (
              <div className="p-12 bg-orange-600 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center shadow-xl">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                    Gatekeeper Alert
                  </h3>
                  <p className="font-bold text-orange-100">
                    Access to Week 13+ is restricted until you complete your
                    Midterm Exam.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/exam/midterm")}
                  className="px-12 py-5 bg-white text-orange-600 rounded-2xl font-black uppercase text-xs shadow-2xl"
                >
                  Start Exam
                </button>
              </div>
            )}
          </div>
        )}

        {/* Curriculum/Courses Tab */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getWeekVideoId(currentWeek)}`}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div
                className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
              >
                <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">
                  Week {currentWeek}: {getWeekTitle(currentWeek)}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium mb-8">
                  This session covers foundational concepts required for your
                  specialization. Ensure you take notes before proceeding to the
                  forum discussion.
                </p>
                <button
                  onClick={() => markWeekAsCompleted(currentWeek)}
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3"
                >
                  <CheckCircle size={18} /> Mark as Completed
                </button>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">
                Up Next
              </h3>
              {[currentWeek, currentWeek + 1, currentWeek + 2].map(
                (w) =>
                  w <= 24 && (
                    <div
                      key={w}
                      className={`p-6 rounded-[2rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"} flex items-center gap-4`}
                    >
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                        {w}
                      </div>
                      <p className="text-[10px] font-black uppercase">
                        {getWeekTitle(w)}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {/* --- STUDENT FORUM SYSTEM --- */}
        {activeTab === "discussions" && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* View 1: Select Course */}
            {viewState === "list" && (
              <div className="space-y-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
                    Forum Repositories
                  </h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    Select your current module to enter the discussion stream.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setViewState("selection");
                      }}
                      className={`p-10 rounded-[3.5rem] border cursor-pointer group transition-all hover:-translate-y-2 ${darkMode ? "bg-slate-900 border-slate-800 hover:border-blue-600" : "bg-white border-gray-100 hover:border-blue-600 shadow-sm"}`}
                    >
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        {course.icon}
                      </div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                        {course.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        Enter Repo <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 2: Select Path (New vs Old) */}
            {viewState === "selection" && (
              <div className="max-w-4xl mx-auto py-20 text-center">
                <h3 className="text-4xl font-black uppercase italic mb-4 tracking-tighter">
                  Student Registry Level
                </h3>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-16">
                  Classify your status for the {selectedCourse?.name} forum.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div
                    onClick={() => {
                      setSelectedPath("Path 1");
                      setViewState("forum");
                    }}
                    className="group p-12 bg-blue-600 text-white rounded-[4rem] cursor-pointer hover:scale-105 transition-all shadow-2xl"
                  >
                    <Users
                      size={48}
                      className="mx-auto mb-6 group-hover:bounce"
                    />
                    <h4 className="text-3xl font-black italic uppercase">
                      Path 1
                    </h4>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mt-2">
                      New Student / Entry Level
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedPath("Path 2");
                      setViewState("forum");
                    }}
                    className={`group p-12 rounded-[4rem] cursor-pointer hover:scale-105 transition-all border-2 border-dashed ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}
                  >
                    <ShieldCheck
                      size={48}
                      className="mx-auto mb-6 text-blue-600"
                    />
                    <h4 className="text-3xl font-black italic uppercase">
                      Path 2
                    </h4>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">
                      Old Student / Returning
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewState("list")}
                  className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 underline"
                >
                  Switch Course Selection
                </button>
              </div>
            )}

            {/* View 3: Live Forum */}
            {viewState === "forum" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div
                    className={`p-10 rounded-[3.5rem] border sticky top-10 ${darkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">
                          {selectedPath}
                        </p>
                        <h4 className="font-black uppercase text-xs">
                          Live Inquiry
                        </h4>
                      </div>
                    </div>
                    <form onSubmit={handlePostQuestion} className="space-y-4">
                      <input
                        className="s-input dark:bg-slate-800"
                        placeholder="SUBJECT"
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({ ...newPost, title: e.target.value })
                        }
                      />
                      <textarea
                        className="s-input dark:bg-slate-800 h-40 pt-5"
                        placeholder="DESCRIBE YOUR TECHNICAL CHALLENGE..."
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                      />
                      <button className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                        <Send size={18} /> Dispatch Thread
                      </button>
                    </form>
                    <button
                      onClick={() => setViewState("selection")}
                      className="w-full mt-6 text-[9px] font-black uppercase opacity-30 hover:opacity-100 tracking-[0.2em]"
                    >
                      Switch Access Level
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div className="flex justify-between items-center mb-6 px-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
                      Activity Stream ({forumThreads.length})
                    </h3>
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
                      Live System
                    </div>
                  </div>

                  {forumThreads.length > 0 ? (
                    forumThreads.map((thread) => (
                      <div
                        key={thread.id}
                        className={`p-10 rounded-[3rem] border transition-all hover:shadow-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-50 shadow-sm"}`}
                      >
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                              {thread.studentName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase">
                                {thread.studentName}
                              </p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(
                                  thread.createdAt?.seconds * 1000,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${darkMode ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                          >
                            {thread.studentType}
                          </span>
                        </div>
                        <h4 className="text-2xl font-black italic uppercase tracking-tight mb-4">
                          {thread.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-8">
                          {thread.content}
                        </p>
                        // Nemo wannan wajen a kasan StudentPortal dinka (Wajen
                        Forum Threads)
                        <div className="pt-8 border-t dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() =>
                              navigate(`/forum/thread/${thread.id}`)
                            }
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:gap-4 transition-all"
                          >
                            View Discussion <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-40 opacity-20 flex flex-col items-center">
                      <MessageSquare size={60} className="mb-4" />
                      <p className="font-black uppercase tracking-[0.4em] text-xs">
                        No Records Found In This Path
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .s-input { width: 100%; padding: 1.25rem 1.75rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.75rem; font-weight: 800; font-size: 0.85rem; outline: none; transition: 0.3s; }
        .s-input:focus { border-color: #2563eb; background: white; box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.2); }
        .dark .s-input { background: #1e293b; color: white; }
        .dark .s-input:focus { background: #0f172a; border-color: #3b82f6; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .group:hover .group-hover\:bounce { animation: bounce 1s infinite; }
      `}</style>
    </div>
  );
};

export default StudentPortal;
