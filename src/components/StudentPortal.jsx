import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
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
  setDoc,
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
  Cpu,
  FileText,
  Download,
  Calendar,
  User,
  Loader2,
  Trophy,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// 1. HELPERS & CONFIGURATION
// ==========================================
const formatDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const libraryLinks = [
  {
    name: "O'Reilly Open Books",
    url: "https://www.oreilly.com/library/view/open-books/",
    cat: "Engineering",
  },
  { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", cat: "CS" },
  {
    name: "Google Scholar Central",
    url: "https://scholar.google.com/",
    cat: "Research",
  },
  {
    name: "GitHub Archive",
    url: "https://archive.org/details/github",
    cat: "Code",
  },
  {
    name: "ArXiv.org AI Research",
    url: "https://arxiv.org/list/cs.AI/recent",
    cat: "AI/ML",
  },
  {
    name: "Microsoft Academic Search",
    url: "https://academic.microsoft.com/",
    cat: "Multi",
  },
  {
    name: "Project Gutenberg",
    url: "https://www.gutenberg.org/",
    cat: "Literature",
  },
  {
    name: "Leanpub Free Shelf",
    url: "https://leanpub.com/bookstore/type/book/sort/top_free",
    cat: "Tech",
  },
  {
    name: "Springboard Data Resources",
    url: "https://www.springboard.com/blog/data-science/data-science-books/",
    cat: "Data",
  },
  {
    name: "Coursera Resource Hub",
    url: "https://www.coursera.org/browse",
    cat: "Courses",
  },
];

const StudentPortal = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("stu-theme") === "dark",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [studentData, setStudentData] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [hasPassedMidterm, setHasPassedMidterm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [weeksData, setWeeksData] = useState({});
  const [viewState, setViewState] = useState("list");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [forumThreads, setForumThreads] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  const [privateMessages, setPrivateMessages] = useState([]);
  const [newPrivateMsg, setNewPrivateMsg] = useState("");

  // Exam States
  const [examActive, setExamActive] = useState(false);
  const [answers, setAnswers] = useState({});
  const [examScore, setExamScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

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
    { id: "ai_tech", name: "Artificial Intelligence", icon: <Cpu size={20} /> },
    {
      id: "blockchain",
      name: "Blockchain Technology",
      icon: <Lock size={20} />,
    },
    { id: "web_dev", name: "Web Development", icon: <PlayCircle size={20} /> },
    {
      id: "digital_marketing",
      name: "Advanced Digital Marketing",
      icon: <Send size={20} />,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Weeks Data from Firestore
  useEffect(() => {
    if (!selectedCourseId) return;
    const unsubWeeks = onSnapshot(
      collection(db, "course_settings"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          if (doc.id.startsWith(selectedCourseId)) {
            const weekPart = doc.id.split("_week_")[1];
            data[weekPart] = doc.data();
          }
        });
        setWeeksData(data);
      },
    );
    return () => unsubWeeks();
  }, [selectedCourseId]);

  // Exam Timer Logic
  useEffect(() => {
    let timer;
    if (examActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examActive) {
      handleExamSubmit(); // Auto-submit when time expires
    }
    return () => clearInterval(timer);
  }, [examActive, timeLeft]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setStudentData({ id: user.uid, ...data });
          if (data.selectedCourseId) setSelectedCourseId(data.selectedCourseId);
          const courseStartDate =
            data.courseSelectionDate?.toDate() || new Date("2026-01-01");
          const diffTime = new Date() - courseStartDate;
          const weekCount =
            Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
          setCurrentWeek(weekCount > 24 ? 24 : weekCount < 1 ? 1 : weekCount);
        }
        const examRef = doc(db, `students/${user.uid}/exams/week_12`);
        const examSnap = await getDoc(examRef);
        if (examSnap.exists() && examSnap.data().passed)
          setHasPassedMidterm(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!studentData?.id) return;
    const q = query(
      collection(db, "private_chats"),
      where("studentId", "==", studentData.id),
      orderBy("createdAt", "asc"),
    );
    const unsubChat = onSnapshot(q, (snap) => {
      setPrivateMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubChat();
  }, [studentData]);

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

  const handleInitialCourseSelection = async (courseId) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const selectionData = {
        selectedCourseId: courseId,
        courseSelectionDate: serverTimestamp(),
        fullName: auth.currentUser.displayName || "Student",
        email: auth.currentUser.email,
      };
      await setDoc(userRef, selectionData, { merge: true });
      setSelectedCourseId(courseId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isWeekLocked = (weekNumber) => {
    const weekSettings = weeksData[String(weekNumber)];
    if (!weekSettings || !weekSettings.startDate) return true;
    const releaseDate = weekSettings.startDate.toDate
      ? weekSettings.startDate.toDate()
      : new Date(weekSettings.startDate);
    const isMidtermLocked = weekNumber > 12 && !hasPassedMidterm;
    return new Date() < releaseDate || isMidtermLocked;
  };

  const handleExamSubmit = async () => {
    setExamActive(false);
    const questions = weeksData[String(currentWeek)]?.exams || [];
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    const finalScore = Math.round((score / 30) * 100);
    setExamScore(finalScore);
    await setDoc(
      doc(db, `students/${studentData.id}/exams/week_${currentWeek}`),
      {
        score: finalScore,
        passed: finalScore >= 50,
        timestamp: serverTimestamp(),
      },
    );
    if (finalScore >= 50 && currentWeek === 12) setHasPassedMidterm(true);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-black text-blue-600 bg-slate-950">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="tracking-widest animate-pulse uppercase">
          Syncing Security Protocols...
        </p>
      </div>
    );

  if (!selectedCourseId)
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? "bg-slate-950" : "bg-gray-100"}`}
      >
        <div className="max-w-6xl w-full">
          <h2
            className={`text-5xl font-black italic uppercase text-center mb-12 ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Select Specialization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => handleInitialCourseSelection(c.id)}
                className={`p-10 rounded-[3rem] border-2 cursor-pointer transition-all hover:scale-105 group ${darkMode ? "bg-slate-900 border-slate-800 hover:border-blue-600" : "bg-white border-white hover:border-blue-600 shadow-xl"}`}
              >
                <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {c.icon}
                </div>
                <h3
                  className={`text-2xl font-black uppercase italic ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  {c.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  const currentWeekInfo = weeksData[String(currentWeek)] || {};

  return (
    <div
      className={`min-h-screen flex font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"} transition-colors duration-300`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-80 border-r flex flex-col transition-transform ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-10 flex flex-col gap-4">
          <h1 className="text-2xl font-black text-blue-600 italic">
            AYAX{" "}
            <span className={darkMode ? "text-white" : "text-gray-900"}>
              UNI
            </span>
          </h1>
          <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20">
            <div className="flex items-center gap-3 text-blue-500 mb-1">
              <Clock size={14} className="animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                System Time
              </span>
            </div>
            <h4 className="text-xl font-black font-mono tracking-tighter">
              {currentTime.toLocaleTimeString("en-GB", { hour12: false })}
            </h4>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
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
            { id: "library", name: "E-Library", icon: <BookOpen size={18} /> },
            { id: "chat", name: "Supervisor Direct", icon: <User size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setViewState("list");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-blue-50/10"}`}
            >
              {item.icon} {item.name}
            </button>
          ))}
          <div className="pt-8 pb-4 text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">
            Roadmap Progress
          </div>
          <div className="space-y-1 pb-10 px-2">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((w) => (
              <div
                key={w}
                onClick={() => !isWeekLocked(w) && setCurrentWeek(w)}
                className={`px-4 py-3 rounded-xl flex items-center justify-between transition-all ${isWeekLocked(w) ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50/10 cursor-pointer"} ${currentWeek === w ? "bg-blue-600/10 border border-blue-600/20" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${isWeekLocked(w) ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {w}
                  </div>
                  <span className="text-[10px] font-black uppercase">
                    Week {w}
                  </span>
                </div>
                {isWeekLocked(w) ? (
                  <Lock size={10} className="text-red-500" />
                ) : (
                  <CheckCircle size={10} className="text-emerald-500" />
                )}
              </div>
            ))}
          </div>
        </nav>
        <div className="p-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest bg-slate-800/50"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />} Shift Mode
          </button>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] uppercase bg-red-600 text-white shadow-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-14 overflow-y-auto">
        <header className="lg:hidden flex justify-between items-center mb-10">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-xl"
          >
            <Menu />
          </button>
          <h2 className="font-black italic uppercase text-blue-600">
            AYAX PORTAL
          </h2>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-blue-600 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <Award className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 rotate-12" />
              <div className="relative z-10">
                <h2 className="text-6xl font-black italic tracking-tighter mb-4 uppercase">
                  {selectedCourseId?.replace("_", " ")}
                </h2>
                <p className="text-lg font-bold opacity-80 max-w-xl">
                  Welcome, {studentData?.fullName}. Processing node data for
                  Week {currentWeek}.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {currentWeek === 12 || currentWeek === 24 ? (
              // SECURE EXAM INTERFACE (NO LECTURE DATA)
              <div
                className={`p-10 rounded-[3rem] border-4 ${darkMode ? "bg-slate-900 border-red-500/20" : "bg-white border-red-500/20 shadow-2xl"}`}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="text-red-600" size={48} />
                    <div>
                      <h2 className="text-4xl font-black italic uppercase">
                        Week {currentWeek} Exam Protocol
                      </h2>
                      <p className="font-black text-xs text-red-500 uppercase tracking-widest">
                        Time Restricted Module: 60 Minutes
                      </p>
                    </div>
                  </div>
                  {examActive && (
                    <div className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-2xl font-mono shadow-xl animate-pulse">
                      {formatTimer(timeLeft)}
                    </div>
                  )}
                </div>

                {!examActive && !examScore ? (
                  <div className="p-10 bg-black/5 rounded-[2rem] border border-white/5">
                    <h4 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                      <AlertTriangle className="text-orange-500" /> Examination
                      Rules
                    </h4>
                    <div className="space-y-4 opacity-80 font-bold mb-10 whitespace-pre-wrap">
                      {currentWeekInfo.examRules ||
                        "1. No external resources permitted.\n2. Once started, the timer cannot be paused.\n3. Automatic submission after 60 minutes.\n4. Ensure a stable network connection."}
                    </div>
                    <button
                      onClick={() => setExamActive(true)}
                      className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase italic text-xl shadow-2xl hover:scale-95 transition-all"
                    >
                      Start 60-Minute Assessment
                    </button>
                  </div>
                ) : examScore !== null ? (
                  <div className="text-center py-20 bg-blue-600/5 rounded-[2rem]">
                    <Trophy className="mx-auto mb-6 text-blue-600" size={80} />
                    <h3 className="text-8xl font-black text-blue-600 mb-4">
                      {examScore}%
                    </h3>
                    <p className="text-2xl font-black uppercase italic">
                      {examScore >= 50
                        ? "Grade: Elite Access Granted"
                        : "Grade: Assessment Failed"}
                    </p>
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="mt-8 text-blue-600 font-black uppercase underline"
                    >
                      Return to Command Center
                    </button>
                  </div>
                ) : (
                  <div className="space-y-12 h-[600px] overflow-y-auto px-4 custom-scrollbar">
                    {currentWeekInfo.exams?.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-8 bg-black/5 rounded-[2rem] border border-white/5"
                      >
                        <p className="text-xl font-black mb-6">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {["A", "B", "C"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() =>
                                setAnswers({ ...answers, [idx]: opt })
                              }
                              className={`p-5 rounded-xl font-black border-2 transition-all ${answers[idx] === opt ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "border-transparent bg-black/10 hover:bg-black/20"}`}
                            >
                              {opt}: {q[`option${opt}`]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleExamSubmit}
                      className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xl shadow-2xl sticky bottom-0"
                    >
                      Finalize & Submit Protocol
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // REGULAR CURRICULUM INTERFACE
              <>
                <div className="bg-black aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-white/5">
                  {isWeekLocked(currentWeek) ? (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-center p-10">
                      <Lock
                        size={64}
                        className="text-red-600 mb-6 animate-pulse"
                      />
                      <h3 className="text-3xl font-black uppercase italic">
                        Temporal Lock Active
                      </h3>
                    </div>
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${currentWeekInfo.videoId}`}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
                <div
                  className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white shadow-xl"}`}
                >
                  <h3 className="text-3xl font-black uppercase italic mb-6">
                    {currentWeekInfo.title || "Lector Module"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
                      <h5 className="font-black text-[10px] uppercase mb-4 flex items-center gap-2">
                        <FileText size={18} /> Resource Node
                      </h5>
                      <a
                        href={currentWeekInfo.pdfNode}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-center text-[10px] uppercase"
                      >
                        Access Material
                      </a>
                    </div>
                    <div
                      className={`p-8 rounded-[2.5rem] border ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                    >
                      <h5 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2">
                        <Clock size={18} /> Weekly Task
                      </h5>
                      <p className="text-sm font-bold opacity-70">
                        {currentWeekInfo.assignment ||
                          "Complete node exercises."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LIBRARY, DISCUSSIONS & CHAT - NO DELETIONS */}
        {activeTab === "library" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6">
            {libraryLinks.map((lib, i) => (
              <a
                key={i}
                href={lib.url}
                target="_blank"
                rel="noreferrer"
                className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-105 group ${darkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-white shadow-xl"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
                    {lib.cat}
                  </span>
                </div>
                <h3
                  className={`text-xl font-black uppercase italic mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  {lib.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600">
                  Open Repository <ChevronRight size={14} />
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === "discussions" && (
          <div className="animate-in fade-in duration-500">
            {viewState === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {availableCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourse(c);
                      setViewState("selection");
                    }}
                    className={`p-10 rounded-[2.5rem] border cursor-pointer hover:border-blue-600 transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
                  >
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                      {c.icon}
                    </div>
                    <h4 className="text-2xl font-black italic uppercase">
                      {c.name}
                    </h4>
                  </div>
                ))}
              </div>
            )}
            {viewState === "selection" && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-10 min-h-[50vh]">
                <button
                  onClick={() => {
                    setSelectedPath("Path 1");
                    setViewState("forum");
                  }}
                  className="p-16 bg-blue-600 text-white rounded-[4rem] font-black italic text-5xl uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Path 1
                </button>
                <button
                  onClick={() => {
                    setSelectedPath("Path 2");
                    setViewState("forum");
                  }}
                  className="p-16 bg-slate-900 text-white rounded-[4rem] font-black italic text-5xl uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Path 2
                </button>
              </div>
            )}
            {viewState === "forum" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div
                  className={`p-10 rounded-[3rem] border sticky top-0 h-fit ${darkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
                >
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newPost.title || !newPost.content) return;
                      await addDoc(collection(db, "forum_threads"), {
                        ...newPost,
                        studentName: studentData?.fullName || "Student",
                        studentId: auth.currentUser.uid,
                        courseId: selectedCourse.id,
                        studentType: selectedPath,
                        createdAt: serverTimestamp(),
                      });
                      setNewPost({ title: "", content: "" });
                    }}
                    className="space-y-4"
                  >
                    <input
                      className="s-input"
                      placeholder="SUBJECT"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                    />
                    <textarea
                      className="s-input h-40 pt-4"
                      placeholder="DETAILS..."
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                    />
                    <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                      Transmit Post
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  {forumThreads.map((t) => (
                    <div
                      key={t.id}
                      className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-sm"}`}
                    >
                      <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">
                        "{t.title}"
                      </h3>
                      <p className="opacity-60 text-sm leading-relaxed mb-8">
                        {t.content}
                      </p>
                      <span className="text-[10px] font-black text-blue-600 uppercase">
                        By {t.studentName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div
            className={`h-[80vh] flex flex-col rounded-[3.5rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-2xl"}`}
          >
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                  Private Secure Link
                </h3>
              </div>
              <ShieldCheck size={30} />
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-4 flex flex-col custom-scrollbar">
              {privateMessages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] p-5 rounded-[2rem] text-sm font-bold shadow-sm ${m.senderRole === "student" ? "bg-blue-600 text-white self-end rounded-tr-none" : "bg-slate-800 text-white self-start rounded-tl-none border border-white/5"}`}
                >
                  {m.text}
                  <div className="text-[8px] opacity-40 mt-2 uppercase">
                    {m.sender} •{" "}
                    {m.createdAt ? formatDate(m.createdAt) : "Transmitting..."}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newPrivateMsg.trim()) return;
                await addDoc(collection(db, "private_chats"), {
                  text: newPrivateMsg,
                  sender: studentData?.fullName || "Student",
                  senderRole: "student",
                  studentId: studentData?.id,
                  createdAt: serverTimestamp(),
                });
                setNewPrivateMsg("");
              }}
              className="p-6 border-t border-white/5 flex gap-4 bg-slate-900/10"
            >
              <input
                value={newPrivateMsg}
                onChange={(e) => setNewPrivateMsg(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-black text-sm"
                placeholder="Transmit direct message..."
              />
              <button className="p-5 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </main>

      <style>{`
        .s-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#1e293b" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.5rem; font-weight: 800; font-size: 0.8rem; outline: none; transition: 0.3s; color: inherit; }
        .s-input:focus { border-color: #2563eb; background: ${darkMode ? "#0f172a" : "white"}; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb33; border-radius: 10px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StudentPortal;
