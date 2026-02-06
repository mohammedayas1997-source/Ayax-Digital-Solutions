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
  ShieldAlert,
  PlusCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";

// ==========================================
// 1. HELPERS (OUTSIDE COMPONENT)
// ==========================================
const getWeekVideoId = (week) => {
  const videoDatabase = {
    1: "dQw4w9WgXcQ",
    2: "y6120QOlsfU",
    3: "VIDEO_ID_3",
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
  const [videoFinished, setVideoFinished] = useState(false);
  const [assignmentLink, setAssignmentLink] = useState("");
  const [forumThreads, setForumThreads] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);

  const totalWeeks = 24;
  const courseStartDate = "2026-01-01";

  // --- Real-time Activity & Data Engine ---
  useEffect(() => {
    const initPortal = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudentData(userSnap.data());
          await updateDoc(userRef, {
            lastOnline: serverTimestamp(),
            status: "Active",
            currentActivity: "Viewing Dashboard",
          });
        }

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

    const calculateProgressState = () => {
      const start = new Date(courseStartDate);
      const now = new Date();
      const diffTime = now - start;
      const weekCount = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
      setCurrentWeek(
        weekCount > totalWeeks ? totalWeeks : weekCount < 1 ? 1 : weekCount,
      );
    };

    calculateProgressState();
    initPortal();
  }, []);

  // Sync Schedule
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "schedules", `week_${currentWeek}`),
      (doc) => {
        if (doc.exists()) {
          setActiveSchedule(doc.data());
        }
      },
    );
    return () => unsub();
  }, [currentWeek]);

  // Track Submissions History
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "submissions"),
      where("studentId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissionHistory(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, [studentData]);

  // Sync Forum
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

  // Calculation for Progress Bar & Days Left
  useEffect(() => {
    if (activeSchedule?.startDate && activeSchedule?.endDate) {
      const start = new Date(activeSchedule.startDate).getTime();
      const end = new Date(activeSchedule.endDate).getTime();
      const now = new Date().getTime();

      if (now < start) setProgress(0);
      else if (now > end) setProgress(100);
      else {
        const totalDuration = end - start;
        const elapsed = now - start;
        setProgress(Math.round((elapsed / totalDuration) * 100));
      }

      const difference = end - now;
      setDaysLeft(Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24))));
    }
  }, [activeSchedule]);

  // --- Actions ---
  const handleSubmitAssignment = async () => {
    if (daysLeft === 0) {
      alert("CRITICAL ERROR: The submission window for this week has closed.");
      return;
    }
    if (!assignmentLink) {
      alert("Please provide a link to your work.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        studentId: auth.currentUser.uid,
        studentName: studentData.fullName,
        course: studentData.course,
        week: currentWeek,
        workLink: assignmentLink,
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#10b981", "#f59e0b"],
      });
      setAssignmentLink("");
      alert("Project submitted successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (submissionId, newLink) => {
    try {
      await updateDoc(doc(db, "submissions", submissionId), {
        workLink: newLink,
        status: "Under Review",
        resubmittedAt: serverTimestamp(),
      });
      confetti();
      alert("Project resubmitted successfully!");
    } catch (err) {
      console.error(err);
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
          currentActivity: `Finished Week ${weekNumber}`,
        });
        alert(`EXCELLENT: Week ${weekNumber} completed.`);
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
      alert("SUCCESS: Your question is live.");
    } catch (err) {
      alert("ERROR: Could not post.");
    }
  };

  const calculateGPA = () => {
    const gradedSubmissions = submissionHistory.filter(
      (sub) => sub.status === "Graded" && sub.score,
    );
    if (gradedSubmissions.length === 0) return 0;
    const totalPoints = gradedSubmissions.reduce(
      (acc, sub) => acc + sub.score,
      0,
    );
    return (totalPoints / gradedSubmissions.length).toFixed(1);
  };

  const averageScore = calculateGPA();
  const isEligibleForCertificate =
    currentWeek >= 24 &&
    parseFloat(averageScore) >= 70 &&
    submissionHistory.length >= 20;

  if (studentData?.accountStatus === "Deactivated") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <ShieldAlert size={80} className="text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-4">
            Access Revoked
          </h2>
          <p className="text-gray-500 mb-8">
            Your academic session has concluded.
          </p>
          <button
            onClick={() => auth.signOut()}
            className="text-blue-600 font-black underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

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

        {/* ACADEMIC SCHEDULE COMPONENT (INTEGRATED) */}
        {activeSchedule && (
          <div className="p-6 bg-white border border-slate-100 rounded-[2rem] mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Learning Period
                </p>
                <p className="text-sm font-black text-slate-800">
                  {activeSchedule.startDate} — {activeSchedule.endDate}
                </p>
              </div>

              {/* Days Remaining Badge */}
              <div
                className={`px-4 py-2 rounded-xl flex flex-col items-center shadow-sm ${
                  daysLeft <= 1
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                }`}
              >
                <p className="text-[18px] font-black leading-none">
                  {daysLeft}
                </p>
                <p className="text-[8px] font-black uppercase tracking-tighter">
                  Days Left
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-indigo-600 bg-indigo-50 tracking-widest">
                    Week {currentWeek} Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black inline-block text-indigo-600">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                <div
                  style={{ width: `${progress}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-in-out ${
                    progress > 85 ? "bg-red-500" : "bg-indigo-600"
                  }`}
                ></div>
              </div>
            </div>

            {daysLeft === 0 && progress >= 100 && (
              <div className="flex items-center gap-3 text-red-500 bg-red-50/50 p-4 rounded-2xl border border-red-100 mt-2">
                <div className="bg-red-500 text-white p-1 rounded-full">
                  <ShieldAlert size={14} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-tight">
                  Week Access Period Expired. Please contact Administration for
                  extension.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- CURRICULUM/COURSES TAB --- */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-2 space-y-8">
              {/* Video Player */}
              <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative group">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getWeekVideoId(currentWeek)}?rel=0&enablejsapi=1`}
                  title="AYAX Academy Lesson"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Completion Section */}
              <div className="mt-8 flex justify-between items-center bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                <div>
                  <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">
                    Finished this week's lesson?
                  </h4>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                    Marking complete will unlock the submission portal.
                  </p>
                </div>
                <button
                  onClick={() => {
                    markWeekAsCompleted(currentWeek);
                    setVideoFinished(true); // This reveals the assignment box
                  }}
                  disabled={daysLeft === 0}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-3 ${
                    daysLeft === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white shadow-blue-200 hover:bg-slate-900"
                  }`}
                >
                  <CheckCircle size={16} />{" "}
                  {daysLeft === 0 ? "Locked" : "Mark as Completed"}
                </button>
              </div>

              {/* DYNAMIC ASSIGNMENT SUBMISSION BOX */}
              {videoFinished && (
                <div className="bg-white p-8 rounded-[3rem] border-2 border-dashed border-blue-200 animate-in zoom-in duration-500 shadow-2xl shadow-blue-900/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <PlusCircle size={20} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic">
                        Project Submission
                      </h3>
                    </div>
                    {loading && (
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={20}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Paste your project URL below
                    </p>
                    <input
                      className="s-input w-full"
                      placeholder="HTTPS://GITHUB.COM/YOUR-PROJECT"
                      value={assignmentLink}
                      onChange={(e) => setAssignmentLink(e.target.value)}
                      disabled={daysLeft === 0 || loading}
                    />
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={daysLeft === 0 || !assignmentLink || loading}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        daysLeft === 0 || loading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl"
                      }`}
                    >
                      {loading ? (
                        "Processing Submission..."
                      ) : daysLeft === 0 ? (
                        <>
                          <Lock size={16} /> Window Closed
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Finalize Submission
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              <td className="p-8 text-center relative">
                <div className="flex flex-col items-center gap-3">
                  <div className="group/tooltip inline-block relative">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter cursor-help transition-all ${
                          sub.status === "Graded"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {sub.status || "Under Review"}
                      </span>
                      {/* DISPLAY SCORE IF GRADED */}
                      {sub.status === "Graded" && sub.score && (
                        <span className="text-sm font-black text-slate-900 italic">
                          {sub.score}%
                        </span>
                      )}
                    </div>

                    {/* FEEDBACK TOOLTIP BOX (Preserved) */}
                    {sub.feedback && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 bg-slate-900 text-white text-[11px] font-medium rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none border border-white/10">
                        <p className="leading-relaxed italic text-gray-300">
                          "{sub.feedback}"
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              {/* Original Lesson Description */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">
                  Week {currentWeek}: {getWeekTitle(currentWeek)}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  This is your primary module for the current week. Ensure you
                  watch the video in full and review any associated assignments
                  below. If you encounter technical challenges, please utilize
                  the "Student Forum" tab.
                </p>
              </div>
            </div>

            {/* Syllabus Sidebar (Preserved exactly as before) */}
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
              <td className="p-8 text-center relative">
                <div className="flex flex-col items-center gap-3">
                  {/* TOOLTIP WRAPPER */}
                  <div className="group/tooltip inline-block relative">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter cursor-help transition-all ${
                        sub.status === "Graded"
                          ? "bg-emerald-100 text-emerald-600"
                          : sub.status === "Needs Revision"
                            ? "bg-red-100 text-red-600 animate-pulse"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {sub.status || "Under Review"}
                    </span>

                    {/* FEEDBACK TOOLTIP BOX */}
                    {sub.feedback && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 bg-slate-900 text-white text-[11px] font-medium rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400 border-b border-white/5 pb-2">
                          <MessageSquare size={12} />
                          <span className="font-black uppercase tracking-widest text-[9px]">
                            Instructor Feedback
                          </span>
                        </div>
                        <p className="leading-relaxed italic text-gray-300">
                          "{sub.feedback}"
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </div>

                  {/* RESUBMIT BUTTON - Only shows if Revision is needed */}
                  {sub.status === "Needs Revision" && (
                    <button
                      onClick={() => {
                        const newLink = prompt(
                          "Enter your updated Project Link:",
                          sub.workLink,
                        );
                        if (newLink) handleResubmit(sub.id, newLink);
                      }}
                      className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <RefreshCw size={10} /> Resubmit Work
                    </button>
                  )}
                </div>
              </td>
            </div>
          </div>
        )}
        <td className="p-8 text-center relative">
          <div className="flex flex-col items-center gap-3">
            <div className="group/tooltip inline-block relative">
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter cursor-help transition-all ${
                    sub.status === "Graded"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {sub.status || "Under Review"}
                </span>
                {/* DISPLAY SCORE IF GRADED */}
                {sub.status === "Graded" && sub.score && (
                  <span className="text-sm font-black text-slate-900 italic">
                    {sub.score}%
                  </span>
                )}
              </div>

              {/* FEEDBACK TOOLTIP BOX (Preserved) */}
              {sub.feedback && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 bg-slate-900 text-white text-[11px] font-medium rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none border border-white/10">
                  <p className="leading-relaxed italic text-gray-300">
                    "{sub.feedback}"
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
              )}
            </div>
          </div>
        </td>
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
        {/* --- SUBMISSION HISTORY TABLE --- */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center justify-between mb-8 px-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                Submission Archive
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">
                Track your academic record and feedback
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
              <span className="text-blue-600 font-black text-xs">
                {submissionHistory.length} Total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Module
                  </th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Project Link
                  </th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Result
                  </th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissionHistory.length > 0 ? (
                  submissionHistory.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="p-8">
                        <span className="font-black text-slate-900 text-sm italic uppercase">
                          Week {sub.week}
                        </span>
                      </td>
                      <td className="p-8">
                        <a
                          href={sub.workLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2"
                        >
                          View Repository <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="p-8 text-center relative">
                        {/* TOOLTIP WRAPPER */}
                        <div className="group/tooltip inline-block relative">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter cursor-help transition-all ${
                              sub.status === "Graded"
                                ? "bg-emerald-100 text-emerald-600 group-hover/tooltip:bg-emerald-600 group-hover/tooltip:text-white"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {sub.status || "Under Review"}
                          </span>

                          {/* FEEDBACK TOOLTIP BOX - Only shows if feedback exists */}
                          {sub.feedback && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 bg-slate-900 text-white text-[11px] font-medium rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none border border-white/10">
                              <div className="flex items-center gap-2 mb-2 text-indigo-400 border-b border-white/5 pb-2">
                                <MessageSquare size={12} />
                                <span className="font-black uppercase tracking-widest text-[9px]">
                                  Instructor Feedback
                                </span>
                              </div>
                              <p className="leading-relaxed italic text-gray-300">
                                "{sub.feedback}"
                              </p>

                              {/* Tooltip Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-8 text-right text-[10px] font-bold text-gray-400 uppercase italic">
                        {sub.createdAt?.toDate().toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-20 text-center opacity-20">
                      <div className="flex flex-col items-center gap-4">
                        <ClipboardList size={48} className="mx-auto" />
                        <p className="font-black uppercase tracking-widest text-xs">
                          No project submissions found in your archive.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* --- GRADUATION & CERTIFICATE SECTION --- */}
        {isEligibleForCertificate && (
          <div className="mb-10 p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3.5rem] text-white shadow-3xl border border-amber-500/30 relative overflow-hidden group animate-in zoom-in duration-1000">
            {/* Decorative Background Elements */}
            <Award className="absolute -right-10 -top-10 w-64 h-64 text-amber-500/10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <div className="px-4 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                      Program Completed
                    </p>
                  </div>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                  Academic <span className="text-amber-500">Excellence</span>{" "}
                  Achieved
                </h3>
                <p className="text-slate-400 font-medium max-w-md leading-relaxed">
                  Congratulations! You have successfully fulfilled all
                  curriculum requirements for the 24-week intensive program with
                  a satisfactory academic standing.
                </p>
              </div>

              <button
                onClick={() => window.print()} // Or link to your PDF generator
                className="px-12 py-6 bg-amber-500 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
              >
                <Download size={20} /> Download Official Certificate
              </button>
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
