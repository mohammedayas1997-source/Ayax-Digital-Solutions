import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
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
  Bell,
  UserCircle,
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Lock,
  Award,
  Send,
  Search,
  ShieldCheck,
} from "lucide-react";

// ==========================================
// 1. HELPERS (OUTSIDE COMPONENT)
// ==========================================
const getWeekVideoId = (week) => {
  const videoDatabase = {
    1: "dQw4w9WgXcQ", // Misali: Sanya YouTube ID na gaskiya a nan
    2: "y6120QOlsfU",
    3: "VIDEO_ID_3",
    // Haka har zuwa week 24...
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
  return titles[week] || "Advanced Study Phase";
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
const StudentPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [hasPassedMidterm, setHasPassedMidterm] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [studentData, setStudentData] = useState(null);

  // Forum State
  const [forumThreads, setForumThreads] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  const totalWeeks = 24;
  const courseStartDate = "2026-01-01";

  // REAL-TIME ACTIVITY & PROFILE ENGINE
  useEffect(() => {
    const initPortal = async () => {
      const user = auth.currentUser;
      if (user) {
        // Fetch Student Detailed Info
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudentData(userSnap.data());
          // Log initial activity for Super Admin
          await updateDoc(userRef, {
            lastOnline: serverTimestamp(),
            status: "Active",
            currentActivity: "Viewing Dashboard",
          });
        }

        // Check Exam Status
        const examRef = doc(
          db,
          `students/${user.uid}/exams/global-course_midterm`,
        );
        const examSnap = await getDoc(examRef);
        if (examSnap.exists() && examSnap.data().status === "passed") {
          setHasPassedMidterm(true);
        }
      }
    };
    const calculateGrade = (studentAnswers, examQuestions) => {
      let correctCount = 0;

      examQuestions.forEach((q, index) => {
        if (studentAnswers[index] === q.correctOption) {
          correctCount++;
        }
      });

      const totalQuestions = examQuestions.length;
      const score = (correctCount / totalQuestions) * 100;

      return {
        percentage: score.toFixed(2),
        passed: score >= 50 ? true : false, // Misali 50% shine pass mark
      };
    };

    const calculateProgress = () => {
      const start = new Date(courseStartDate);
      const now = new Date();
      const diffTime = now - start;
      const weekCount = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
      setCurrentWeek(
        weekCount > totalWeeks ? totalWeeks : weekCount < 1 ? 1 : weekCount,
      );
    };

    calculateProgress();
    initPortal();
  }, []);

  // Sync Forum Threads
  useEffect(() => {
    if (activeTab === "discussions" && studentData?.course) {
      const q = query(
        collection(db, "forum_threads"),
        where("course", "==", studentData.course),
        orderBy("createdAt", "desc"),
      );
      const unsub = onSnapshot(q, (snap) => {
        setForumThreads(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
      return () => unsub();
    }
  }, [activeTab, studentData]);

  // AUTHORITY TRACKING
  const trackStudentAction = async (action) => {
    const user = auth.currentUser;
    if (user) {
      const logRef = doc(db, "users", user.uid);
      await updateDoc(logRef, {
        currentActivity: action,
        lastInteraction: serverTimestamp(),
      });
    }
  };

  const markWeekAsCompleted = async (weekNumber) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`progress.week_${weekNumber}`]: {
            completed: true,
            completedAt: serverTimestamp(),
          },
          currentActivity: `Finished Week ${weekNumber} Lesson`,
        });
        alert(`EXCELLENT: Week ${weekNumber} marked as completed.`);
      } catch (err) {
        alert("ERROR: Could not sync progress.");
      }
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
        course: studentData.course,
        createdAt: serverTimestamp(),
        replies: 0,
      });
      setNewPost({ title: "", content: "" });
      alert("SUCCESS: Your question is live. The Admin has been notified.");
    } catch (err) {
      alert("ERROR: Could not post.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-10">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">
            AYAX <span className="text-gray-900 not-italic">UNI</span>
          </h1>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">
            Learning Management System
          </p>
        </div>

        <nav className="px-6 space-y-2">
          {[
            {
              id: "dashboard",
              name: "Dashboard",
              icon: <LayoutDashboard size={18} />,
            },
            { id: "courses", name: "Curriculum", icon: <BookOpen size={18} /> },
            {
              id: "discussions",
              name: "Student Forum",
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
                trackStudentAction(`Viewing ${item.name}`);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-2xl shadow-blue-200" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        {/* 24-WEEK TIMELINE ROADMAP */}
        <div className="mt-10 px-6 flex-grow overflow-y-auto custom-scrollbar">
          <h3 className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6">
            24-Week Progress
          </h3>
          <div className="space-y-2 pb-20">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              let isLocked = week > currentWeek;
              if (week > 12 && !hasPassedMidterm) isLocked = true;
              const isExamWeek = week === 12 || week === 24;

              return (
                <div
                  key={week}
                  onClick={() => {
                    if (!isLocked) {
                      trackStudentAction(`Studying Week ${week}`);
                      if (week === 12)
                        navigate(`/course/global-course/exam/week/12`);
                      else if (week === 24)
                        navigate(`/course/global-course/exam/week/24`);
                      else navigate(`/course/global-course/week/${week}`);
                    }
                  }}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
                    isLocked
                      ? "opacity-30 cursor-not-allowed bg-gray-50"
                      : "hover:bg-blue-50 cursor-pointer group border border-transparent hover:border-blue-100"
                  } ${week === 12 && !hasPassedMidterm ? "bg-orange-50/50 border-orange-100" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                        isLocked
                          ? "bg-gray-200 text-gray-400"
                          : isExamWeek
                            ? "bg-orange-500 text-white shadow-lg"
                            : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }`}
                    >
                      {week}
                    </div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-tight ${isLocked ? "text-gray-400" : "text-gray-900"}`}
                    >
                      Week {week}{" "}
                      {isExamWeek && (
                        <span className="ml-1 text-orange-600 font-black italic">
                          ! EXAM
                        </span>
                      )}
                    </span>
                  </div>
                  {isLocked ? (
                    <Lock size={12} className="text-gray-300" />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="text-blue-200 group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-14 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase">
              Academic Core
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3 flex items-center gap-2">
              <span className="text-blue-600">{studentData?.course}</span>
              <span className="text-gray-200">|</span>
              <span>
                Global Progress: {Math.round((currentWeek / totalWeeks) * 100)}%
              </span>
            </p>
          </div>

          <div className="bg-white p-3 pr-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
              {studentData?.fullName?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Authenticated Student
              </p>
              <p className="font-black text-sm text-gray-900 tracking-tight">
                {studentData?.fullName || "Loading Profile..."}
              </p>
            </div>
          </div>
        </header>

        {/* --- CURRICULUM/COURSES TAB --- */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative group">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getWeekVideoId(currentWeek)}?rel=0&modestbranding=1`}
                  title="AYAX Academy Lesson"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="mt-8 flex justify-between items-center bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                <div>
                  <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">
                    Kammala Darasin Satin Nan?
                  </h4>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                    Wannan zai sanar da Admin dinka ka gama.
                  </p>
                </div>
                <button
                  onClick={() => markWeekAsCompleted(currentWeek)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all flex items-center gap-3"
                >
                  <CheckCircle size={16} /> Mark as Completed
                </button>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">
                  Week {currentWeek}: {getWeekTitle(currentWeek)}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Wannan shine babban darasinmu na wannan satin. Tabbatar ka
                  kalli bidiyon nan duka sannan ka duba assignment dake kasa.
                  Idan kana da tambaya, kayi amfani da "Student Forum" tab.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Course Syllabus
              </h3>
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                (week) => {
                  const isLocked =
                    week > currentWeek || (week > 12 && !hasPassedMidterm);
                  return (
                    <div
                      key={week}
                      onClick={() =>
                        !isLocked &&
                        trackStudentAction(`Switching to Week ${week} Video`)
                      }
                      className={`p-5 rounded-2xl flex items-center gap-4 border transition-all ${
                        isLocked
                          ? "opacity-40 bg-gray-50"
                          : "bg-white hover:border-blue-300 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? "bg-gray-200" : "bg-blue-50 text-blue-600"}`}
                      >
                        {isLocked ? (
                          <Lock size={16} />
                        ) : (
                          <PlayCircle size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase">
                          Lesson {week}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          Fundamentals & Practice
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* --- FORUM / DISCUSSIONS TAB --- */}
        {activeTab === "discussions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-1">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-blue-50 sticky top-10">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-2 text-slate-900 tracking-tight">
                  Open Inquiry
                </h3>
                <p className="text-gray-400 text-xs font-medium mb-8">
                  Your instructor and the Super Admin monitor these threads for
                  quality assurance.
                </p>
                <form onSubmit={handlePostQuestion} className="space-y-4">
                  <input
                    className="s-input"
                    placeholder="THREAD SUBJECT"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                  />
                  <textarea
                    className="s-input h-40 pt-6"
                    placeholder="DESCRIBE YOUR CHALLENGE..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                  />
                  <button className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                    <Send size={16} /> Dispatch Question
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">
                Live Discussions ({forumThreads.length})
              </h3>
              {forumThreads.length > 0 ? (
                forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-xl group"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest italic">
                        Technical Thread
                      </span>
                      <span className="text-[10px] font-black text-gray-300 uppercase italic flex items-center gap-2">
                        <Clock size={12} />{" "}
                        {thread.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">
                      {thread.title}
                    </h4>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                      {thread.content}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
                          {thread.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-1 leading-none">
                            Status
                          </p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Active & Monitored
                          </p>
                        </div>
                      </div>
                      <button className="px-8 py-3 bg-gray-50 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
                        View Thread <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                  <MessageSquare size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">
                    No active discussions in your course yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-1000">
            {currentWeek >= 12 && !hasPassedMidterm && (
              <div className="p-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center shadow-3xl relative overflow-hidden group">
                <Award className="absolute -right-16 -bottom-16 w-80 h-80 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                <div className="relative z-10">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4">
                    Academic Blockade
                  </h3>
                  <p className="font-bold text-orange-100 max-w-lg text-lg leading-relaxed mb-4">
                    You have reached Week 12. Access to advanced content is
                    locked until you pass your Midterm Examination.
                  </p>
                  <div className="flex items-center gap-4 text-orange-200 font-black text-[10px] uppercase tracking-[0.3em]">
                    <ShieldCheck size={16} /> Requirement: Score 70%+
                  </div>
                </div>
                <button
                  onClick={() => navigate("/course/global-course/exam/week/12")}
                  className="relative z-10 mt-8 md:mt-0 px-14 py-6 bg-white text-orange-600 rounded-[2rem] font-black text-xs uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Initiate Exam
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Current Phase
                </p>
                <h4 className="text-3xl font-black italic text-blue-600 tracking-tighter">
                  WEEK {currentWeek}
                </h4>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Total Modules
                </p>
                <h4 className="text-3xl font-black italic text-slate-900 tracking-tighter">
                  24 PHASES
                </h4>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Next Milestone
                </p>
                <h4 className="text-3xl font-black italic text-emerald-400 tracking-tighter">
                  {currentWeek < 12
                    ? "MIDTERM"
                    : currentWeek < 24
                      ? "FINALS"
                      : "GRADUATION"}
                </h4>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .s-input { width: 100%; padding: 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 2rem; font-weight: 800; font-size: 0.85rem; outline: none; transition: 0.3s; color: #1e293b; }
        .s-input:focus { border-color: #2563eb; background: white; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default StudentPortal;
