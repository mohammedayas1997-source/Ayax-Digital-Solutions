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
  addDoc,
  query,
  orderBy,
  limit,
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
  Bell,
  Search,
  FileText,
  Download,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Layers,
  Cpu,
  Globe,
  Settings,
  Send,
  Database,
  Code2,
} from "lucide-react";

const StudentPortal = () => {
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [courseContent, setCourseContent] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Darussa guda 7 kamar yadda ka nema
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
    { id: "web_dev", name: "Web Development", icon: <Globe size={20} /> },
    { id: "data_science", name: "Data Science", icon: <Database size={20} /> },
    { id: "ai_tech", name: "Artificial Intelligence", icon: <Cpu size={20} /> },
    { id: "mobile_app", name: "App Development", icon: <Code2 size={20} /> },
    { id: "ui_ux", name: "UI/UX Design", icon: <Search size={20} /> },
  ];

  // --- 1. Auth & Data Fetch ---
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
        if (data.selectedCourse) setSelectedCourseId(data.selectedCourse);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- 2. Content & Forum Sync ---
  useEffect(() => {
    if (selectedCourseId) {
      // Fetch Syllabus Content
      const contentRef = collection(db, "courses", selectedCourseId, "weeks");
      const unsubContent = onSnapshot(contentRef, (snapshot) => {
        const weeks = {};
        snapshot.forEach((doc) => {
          weeks[doc.id] = doc.data();
        });
        setCourseContent(weeks);
      });

      // Fetch Forum Messages
      const forumRef = collection(db, "courses", selectedCourseId, "forum");
      const q = query(forumRef, orderBy("createdAt", "asc"), limit(50));
      const unsubForum = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      });

      return () => {
        unsubContent();
        unsubForum();
      };
    }
  }, [selectedCourseId]);

  // --- 3. Actions ---
  const handleCourseSelection = async (courseId) => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        selectedCourse: courseId,
        courseJoinedAt: serverTimestamp(),
      });
      setSelectedCourseId(courseId);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "courses", selectedCourseId, "forum"), {
      text: newMessage,
      sender: studentData.fullName,
      uid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  const isLocked = (weekNum) => {
    const data = courseContent[`week_${weekNum}`];
    return !data || data.isLocked;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 font-black italic">
        <div className="animate-spin mb-4">
          <Cpu size={40} />
        </div>
        AUTHENTICATING SYSTEM...
      </div>
    );

  // --- SCREEN A: Course Selection (7 Courses) ---
  if (!selectedCourseId) {
    return (
      <div className="min-h-screen p-8 bg-slate-950 text-white flex flex-col items-center">
        <h1 className="text-5xl font-black italic mb-2 uppercase tracking-tighter">
          Initialize Path
        </h1>
        <p className="text-gray-500 mb-12 text-[10px] font-bold tracking-[0.4em] uppercase">
          Select one of the 7 available specializations
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {availableCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseSelection(course.id)}
              className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] hover:border-blue-600 hover:bg-blue-600/5 cursor-pointer transition-all group shadow-xl"
            >
              <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                {course.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tight">
                {course.name}
              </h3>
              <p className="text-[9px] text-gray-600 mt-2 font-black uppercase">
                Click to Initialize
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentWeekData = courseContent[`week_${currentWeek}`] || {};

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-2xl font-black italic text-blue-600 tracking-tighter">
            AYAX UNI
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
              System Online
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            {
              id: "dashboard",
              label: "Dashboard",
              icon: <LayoutDashboard size={18} />,
            },
            {
              id: "curriculum",
              label: "Curriculum",
              icon: <BookOpen size={18} />,
            },
            {
              id: "community",
              label: "Campus Forum",
              icon: <MessageSquare size={18} />,
            },
            {
              id: "settings",
              label: "Account Settings",
              icon: <Settings size={18} />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-500 hover:bg-white/5"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div className="mt-10 mb-4 px-6 text-[8px] font-black text-gray-700 uppercase tracking-widest">
            Module Progression
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              disabled={isLocked(w)}
              onClick={() => {
                setCurrentWeek(w);
                setActiveTab("curriculum");
              }}
              className={`w-full flex items-center justify-between px-6 py-3 rounded-xl transition-all ${currentWeek === w ? "bg-blue-600/10 text-blue-500" : "text-gray-600"} ${isLocked(w) ? "opacity-20 cursor-not-allowed" : "hover:bg-white/5"}`}
            >
              <span className="text-[10px] font-black uppercase">Week {w}</span>
              {isLocked(w) ? <Lock size={12} /> : <ChevronRight size={12} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={() => signOut(auth)}
            className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-xl"
          >
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* --- MAIN MAIN --- */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-900 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-xl z-20">
          <div className="flex items-center bg-slate-900 px-4 py-2 rounded-2xl w-80 border border-slate-800">
            <Search size={16} className="text-gray-600" />
            <input
              type="text"
              placeholder="Search syllabus..."
              className="bg-transparent border-none outline-none px-4 text-xs font-bold w-full"
            />
          </div>
          <div className="flex items-center gap-6">
            <Bell
              size={20}
              className="text-gray-500 hover:text-white cursor-pointer"
            />
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-sm italic shadow-lg shadow-blue-900/20">
              {studentData?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-16 rounded-[4rem] mb-12 relative overflow-hidden shadow-2xl border border-blue-400/20">
                <Award className="absolute right-[-30px] bottom-[-30px] size-72 opacity-10 rotate-12" />
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
                  Core
                  <br />
                  Operational
                  <br />
                  Dashboard
                </h1>
                <p className="font-black opacity-60 uppercase text-xs tracking-[0.5em]">
                  {studentData?.fullName} // {selectedCourseId.toUpperCase()}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-xl">
                  <p className="text-gray-600 text-[9px] font-black uppercase mb-4 tracking-[0.2em]">
                    Active Milestone
                  </p>
                  <h3 className="text-6xl font-black italic tracking-tighter">
                    W-{currentWeek}
                  </h3>
                </div>
                <div className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-xl">
                  <p className="text-gray-600 text-[9px] font-black uppercase mb-4 tracking-[0.2em]">
                    System Integrity
                  </p>
                  <h3 className="text-6xl font-black italic tracking-tighter text-blue-500">
                    98%
                  </h3>
                </div>
                <div className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-xl">
                  <p className="text-gray-600 text-[9px] font-black uppercase mb-4 tracking-[0.2em]">
                    Rank Status
                  </p>
                  <h3 className="text-6xl font-black italic tracking-tighter text-emerald-500">
                    Master
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* CURRICULUM */}
          {activeTab === "curriculum" && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-6xl">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
                    Resource Deployment
                  </span>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter mt-2">
                    Week {currentWeek}:{" "}
                    {currentWeekData.title || "Awaiting Data..."}
                  </h2>
                </div>
              </div>
              <div className="aspect-video bg-black rounded-[3.5rem] overflow-hidden border-[12px] border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.6)] mb-12">
                {currentWeekData.videoUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentWeekData.videoUrl.replace("watch?v=", "embed/")}
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-10 bg-slate-950">
                    <PlayCircle size={100} />
                    <p className="font-black mt-6 tracking-widest text-xs uppercase">
                      Encrypted Content
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="p-12 bg-blue-600 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/40">
                  <FileText className="mb-6 size-12" />
                  <h4 className="text-3xl font-black uppercase italic mb-6 tracking-tighter">
                    Handouts & Slidez
                  </h4>
                  {currentWeekData.pdfUrl ? (
                    <a
                      href={currentWeekData.pdfUrl}
                      target="_blank"
                      className="inline-flex items-center gap-4 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      <Download size={18} /> Download Asset
                    </a>
                  ) : (
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em]">
                      No files attached to this module.
                    </p>
                  )}
                </div>
                <div className="p-12 bg-slate-900 rounded-[3.5rem] border border-slate-800">
                  <Calendar className="text-blue-500 mb-6 size-12" />
                  <h4 className="text-3xl font-black uppercase italic mb-6 tracking-tighter">
                    Weekly Mission
                  </h4>
                  <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                    {currentWeekData.assignment ||
                      "Contact faculty for mission details."}
                  </p>
                  <button className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest hover:text-emerald-400">
                    <CheckCircle size={20} /> Mark Mission Accomplished
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORUM */}
          {activeTab === "community" && (
            <div className="animate-in zoom-in-95 duration-500 max-w-5xl h-full flex flex-col">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">
                  Campus Relay
                </h2>
                <div className="px-6 py-2 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Secure Channel
                </div>
              </div>
              <div className="flex-1 bg-slate-900 rounded-[3.5rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                <div className="flex-1 p-10 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.uid === auth.currentUser.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md p-5 rounded-3xl ${m.uid === auth.currentUser.uid ? "bg-blue-600 rounded-tr-none" : "bg-slate-800 rounded-tl-none border border-slate-700"}`}
                      >
                        <p className="text-[9px] font-black uppercase mb-1 opacity-50">
                          {m.sender}
                        </p>
                        <p className="text-sm font-bold leading-snug">
                          {m.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="p-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex gap-4"
                >
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Transmit message to campus..."
                    className="flex-1 bg-slate-800 border-2 border-slate-700 outline-none rounded-2xl px-8 text-sm font-bold focus:border-blue-600 transition-all"
                  />
                  <button
                    type="submit"
                    className="p-5 bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-900/40 transition-all active:scale-90"
                  >
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;
