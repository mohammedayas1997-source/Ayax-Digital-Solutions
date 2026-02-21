import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  orderBy,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import {
  Users,
  LogOut,
  MessageSquare,
  Loader2,
  Sun,
  Moon,
  ShieldCheck,
  Send,
  BookOpen,
  History,
  Lock,
  ExternalLink,
  Wallet,
  Settings,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  UploadCloud,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("forum");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NEW STATES: PRIVATE MESSAGING & HISTORY
  const [privateMessages, setPrivateMessages] = useState([]);
  const [selectedStudentForDM, setSelectedStudentForDM] = useState(null);
  const [dmText, setDmText] = useState("");
  const [systemLogs, setSystemLogs] = useState([]);

  // SETTINGS & IDENTITY STATES
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("super-theme") === "dark",
  );
  const [supervisorData, setSupervisorData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [settingsMsg, setSettingsMsg] = useState({ type: "", text: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const availableCourses = [
    "Cyber security",
    "Data Analytics",
    "Software Engineering",
    "Artificial Intelligence",
    "Blockchain Technology",
    "Web development",
    "advanced Digital Marketing",
  ];

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

  // 1. AUTH & THEME PERSISTENCE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists())
            setSupervisorData({ id: user.uid, ...snap.data() });
        });
        setAuthLoading(false);
      } else {
        navigate("/admin-gateway");
      }
    });
    localStorage.setItem("super-theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
    return () => unsubscribe();
  }, [isDarkMode, navigate]);

  // 2. DATA SYNC (STUDENTS, FORUM, PRIVATE DMS, LOGS)
  useEffect(() => {
    if (!selectedCourse) return;

    const unsubStudents = onSnapshot(
      query(
        collection(db, "course_applications"),
        where("status", "==", "Admitted"),
        where("course", "==", selectedCourse),
      ),
      (snap) =>
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    );

    const unsubForum = onSnapshot(
      query(
        collection(db, "forum_threads"),
        where("courseId", "==", selectedCourse),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setForumThreads(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ),
    );

    const unsubLogs = onSnapshot(
      query(collection(db, "system_logs"), orderBy("timestamp", "desc")),
      (snap) =>
        setSystemLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubStudents();
      unsubForum();
      unsubLogs();
    };
  }, [selectedCourse]);

  // FORUM REPLIES LISTENER
  useEffect(() => {
    if (!activeThread) return;
    const unsubReplies = onSnapshot(
      query(
        collection(db, `forum_threads/${activeThread.id}/replies`),
        orderBy("createdAt", "asc"),
      ),
      (snap) => setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return () => unsubReplies();
  }, [activeThread]);

  // PRIVATE MESSAGE LISTENER
  useEffect(() => {
    if (!selectedStudentForDM) return;
    const q = query(
      collection(db, "private_chats"),
      where("studentId", "==", selectedStudentForDM.id),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setPrivateMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedStudentForDM]);

  // --- SETTINGS PROTOCOLS ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const storageRef = ref(
        storage,
        `supervisors/${supervisorData.id}_${Date.now()}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", supervisorData.id), { photoURL: url });
      setSettingsMsg({ type: "success", text: "Identity image updated." });
    } catch (err) {
      setSettingsMsg({ type: "error", text: "Upload failed." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm)
      return setSettingsMsg({ type: "error", text: "Passwords mismatch." });
    setIsUpdating(true);
    try {
      const cred = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwords.current,
      );
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, passwords.new);
      setSettingsMsg({
        type: "success",
        text: "Security credentials updated.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      setSettingsMsg({ type: "error", text: "Current password invalid." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendDM = async (e) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    await addDoc(collection(db, "private_chats"), {
      text: dmText,
      sender: supervisorData.fullName || "Supervisor",
      senderRole: "supervisor",
      studentId: selectedStudentForDM.id,
      createdAt: serverTimestamp(),
    });
    setDmText("");
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
      text: reply,
      sender: supervisorData.fullName || "Supervisor",
      role: "supervisor",
      createdAt: serverTimestamp(),
    });
    setReply("");
  };

  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Supervisor Session?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  if (authLoading)
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? "bg-slate-950 text-blue-500" : "bg-white text-blue-600"}`}
      >
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-[0.3em] text-xs">
          Authenticating Supervisor Node...
        </p>
      </div>
    );

  if (!selectedCourse)
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 lg:p-6 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}
      >
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col justify-center text-center md:text-left">
            <h1 className="text-5xl lg:text-6xl font-black italic tracking-tighter mb-4 text-blue-600 text-shadow-glow">
              AYAX.SV
            </h1>
            <p
              className={`font-black uppercase tracking-widest text-[10px] lg:text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              System Terminal Access
            </p>
            <h2
              className={`text-2xl lg:text-3xl font-bold mt-4 lg:mt-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Welcome, {supervisorData?.fullName}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {availableCourses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] text-left transition-all group border ${isDarkMode ? "bg-white/5 border-white/10 hover:bg-blue-600" : "bg-white border-slate-200 hover:bg-blue-600"}`}
              >
                <p
                  className={`font-black text-base lg:text-lg group-hover:text-white transition-all ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {course}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={`flex flex-col lg:flex-row min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-slate-900"}`}
    >
      {/* MOBILE HEADER */}
      <header
        className={`lg:hidden flex items-center justify-between p-4 border-b sticky top-0 z-[100] ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
      >
        <div
          className="flex items-center gap-2"
          onClick={() => setSelectedCourse(null)}
        >
          <ShieldCheck className="text-blue-600" size={24} />
          <h2 className="text-lg font-black italic text-blue-600 tracking-tighter">
            AYAX CORE
          </h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-blue-600 text-white rounded-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-72 lg:w-80 border-r p-6 lg:p-8 flex flex-col transition-transform duration-300 transform lg:translate-x-0 lg:sticky lg:h-screen ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
      >
        <div
          className="hidden lg:flex items-center gap-3 mb-10 cursor-pointer"
          onClick={() => setSelectedCourse(null)}
        >
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-black italic text-blue-600 uppercase tracking-tighter">
            AYAX CORE
          </h2>
        </div>

        <nav className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {[
            {
              id: "forum",
              icon: <MessageSquare size={18} />,
              label: "Forum Patrol",
            },
            { id: "dm", icon: <Lock size={18} />, label: "Private DMs" },
            {
              id: "students",
              icon: <Users size={18} />,
              label: "Student Roster",
            },
            { id: "library", icon: <BookOpen size={18} />, label: "E-Library" },
            {
              id: "history",
              icon: <History size={18} />,
              label: "System Logs",
            },
            { id: "settings", icon: <Settings size={18} />, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`t-nav ${activeTab === tab.id ? "t-active" : ""}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* SALARY MODULE */}
        <div className="mt-6 mb-6 p-5 lg:p-6 bg-blue-600 rounded-2xl lg:rounded-3xl text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} />
            <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">
              Allowance
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black tracking-tighter">
            ₦{supervisorData?.salary?.toLocaleString() || "0.00"}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center gap-3 p-3 lg:p-4 bg-slate-800/50 rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} Spectrum
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 lg:p-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-10 gap-4">
          <h1 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter">
            {activeTab.replace("_", " ")} Node
          </h1>
          <div className="px-4 py-2 bg-blue-600/10 rounded-xl text-blue-600 font-black text-[10px] lg:text-xs uppercase tracking-widest border border-blue-600/20">
            {selectedCourse}
          </div>
        </header>

        {/* SETTINGS MODULE */}
        {activeTab === "settings" && (
          <div className="max-w-4xl space-y-8 lg:space-y-12 animate-in fade-in duration-500">
            {settingsMsg.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase border ${settingsMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}
              >
                {settingsMsg.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}{" "}
                {settingsMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex justify-center md:block">
                <div className="relative group w-48 lg:w-full">
                  <div className="w-full aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-4 border-blue-600/20 bg-slate-800 flex items-center justify-center relative">
                    {supervisorData?.photoURL ? (
                      <img
                        src={supervisorData.photoURL}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={60} className="text-slate-700" />
                    )}
                    {isUpdating && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <RefreshCcw className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 lg:-bottom-4 -right-2 lg:-right-4 p-3 lg:p-4 bg-blue-600 text-white rounded-xl lg:rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-all">
                    <Camera size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <form
                  onSubmit={handlePasswordUpdate}
                  className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border space-y-4 lg:space-y-6 ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl border-slate-100"}`}
                >
                  <input
                    type="password"
                    placeholder="CURRENT PASSWORD"
                    required
                    className="s-input"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="password"
                      placeholder="NEW PASSWORD"
                      required
                      className="s-input"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                    />
                    <input
                      type="password"
                      placeholder="CONFIRM NEW"
                      required
                      className="s-input"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                    />
                  </div>
                  <button
                    disabled={isUpdating}
                    className="w-full py-4 lg:py-5 bg-blue-600 text-white rounded-xl lg:rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                  >
                    {isUpdating ? (
                      <RefreshCcw className="animate-spin" />
                    ) : (
                      <>
                        <UploadCloud size={16} /> Update Security
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* FORUM INTERFACE */}
        {activeTab === "forum" && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[75vh]">
            <div
              className={`w-full lg:w-1/3 rounded-[1.5rem] lg:rounded-[2.5rem] border overflow-hidden flex flex-col max-h-[40vh] lg:max-h-full ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="p-4 lg:p-6 border-b border-slate-800 font-black uppercase text-[10px] opacity-50">
                Active Forum Threads
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-4 lg:p-6 border-b border-slate-800 cursor-pointer transition-all ${activeThread?.id === thread.id ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"}`}
                  >
                    <p className="font-black text-xs lg:text-sm line-clamp-1 italic uppercase">
                      "{thread.title}"
                    </p>
                    <p
                      className={`text-[10px] mt-1 lg:mt-2 font-bold ${activeThread?.id === thread.id ? "text-blue-100" : "text-slate-400"}`}
                    >
                      By {thread.studentName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`flex-1 rounded-[1.5rem] lg:rounded-[2.5rem] border flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"}`}
            >
              {activeThread ? (
                <>
                  <div
                    className={`p-6 lg:p-8 border-b ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100"}`}
                  >
                    <h3 className="font-black text-xl lg:text-2xl italic uppercase">
                      {activeThread.title}
                    </h3>
                    <p className="opacity-60 text-xs lg:text-sm mt-3 leading-relaxed">
                      {activeThread.content}
                    </p>
                  </div>
                  <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-4 lg:space-y-6 flex flex-col custom-scrollbar">
                    {replies.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[85%] lg:max-w-[80%] p-4 rounded-2xl lg:rounded-3xl ${msg.role === "supervisor" ? "bg-blue-600 text-white self-end rounded-tr-none" : "bg-slate-800 text-white self-start"}`}
                      >
                        <p className="text-[8px] font-black uppercase mb-1 opacity-70">
                          {msg.sender}
                        </p>
                        <p className="text-xs lg:text-sm font-medium italic">
                          "{msg.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleReply}
                    className="p-4 lg:p-6 border-t border-slate-800 flex gap-3 lg:gap-4"
                  >
                    <input
                      className="flex-1 bg-transparent outline-none font-black text-xs lg:text-sm"
                      placeholder="Post reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button className="p-4 lg:p-5 bg-blue-600 text-white rounded-xl lg:rounded-2xl">
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-8 text-center">
                  <MessageSquare size={60} />
                  <p className="font-black uppercase text-[10px] mt-4">
                    Select Public Forum Thread
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DM SECTION */}
        {activeTab === "dm" && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[75vh]">
            <div
              className={`w-full lg:w-1/3 rounded-[1.5rem] lg:rounded-[2.5rem] border flex flex-col max-h-[40vh] lg:max-h-full ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
            >
              <div className="p-4 lg:p-6 font-black uppercase text-[10px] opacity-50 border-b border-slate-800">
                Student Directory
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudentForDM(s)}
                    className={`p-4 lg:p-6 border-b border-slate-800 cursor-pointer transition-all ${selectedStudentForDM?.id === s.id ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"}`}
                  >
                    <p className="font-black uppercase text-xs lg:text-sm">
                      {s.studentName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`flex-1 rounded-[1.5rem] lg:rounded-[2.5rem] border flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0 ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
            >
              {selectedStudentForDM ? (
                <>
                  <div className="p-6 lg:p-8 border-b border-slate-800">
                    <h3 className="font-black italic uppercase text-blue-600 text-xs lg:text-base">
                      Secure Direct Line: {selectedStudentForDM.studentName}
                    </h3>
                  </div>
                  <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                    {privateMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[85%] lg:max-w-[70%] p-4 lg:p-5 rounded-2xl lg:rounded-3xl font-bold text-xs lg:text-sm ${m.senderRole === "supervisor" ? "bg-blue-600 text-white self-end" : "bg-slate-800 text-white self-start"}`}
                      >
                        {m.text}
                        <div className="text-[8px] opacity-50 mt-2 uppercase">
                          {m.sender}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleSendDM}
                    className="p-4 lg:p-6 border-t border-slate-800 flex gap-3 lg:gap-4"
                  >
                    <input
                      value={dmText}
                      onChange={(e) => setDmText(e.target.value)}
                      placeholder="Type private message..."
                      className="flex-1 bg-transparent outline-none font-black text-xs lg:text-sm"
                    />
                    <button className="p-4 bg-blue-600 text-white rounded-xl lg:rounded-2xl">
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-8 text-center">
                  <Lock size={60} />
                  <p className="font-black uppercase text-[10px] mt-4">
                    Select Student for Private Link
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROSTER SECTION */}
        {activeTab === "students" && (
          <div
            className={`rounded-[1.5rem] lg:rounded-[3rem] border overflow-x-auto custom-scrollbar ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
          >
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest border-b border-slate-800 bg-slate-800/10 text-slate-500">
                  <th className="p-6 lg:p-8">Student Identity</th>
                  <th className="p-6 lg:p-8">Track</th>
                  <th className="p-6 lg:p-8 text-center">Authorization</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std) => (
                  <tr
                    key={std.id}
                    className="border-b border-slate-800/5 hover:bg-blue-600/5 transition-all"
                  >
                    <td className="p-6 lg:p-8 flex items-center gap-4">
                      <div className="w-8 lg:w-10 h-8 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-[10px] lg:text-xs">
                        {std.studentName?.charAt(0)}
                      </div>
                      <p className="font-black text-xs lg:text-sm uppercase">
                        {std.studentName}
                      </p>
                    </td>
                    <td className="p-6 lg:p-8 text-[10px] lg:text-xs font-bold text-blue-500 italic">
                      {std.course}
                    </td>
                    <td className="p-6 lg:p-8 text-center">
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-full inline-block">
                        Authorized
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS SECTION */}
        {activeTab === "history" && (
          <div
            className={`rounded-[1.5rem] lg:rounded-[2.5rem] border overflow-x-auto custom-scrollbar ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white shadow-xl"}`}
          >
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-[9px] lg:text-[10px] font-black uppercase text-slate-500 border-b border-slate-800 bg-slate-800/20">
                  <th className="p-4 lg:p-6">Action</th>
                  <th className="p-4 lg:p-6">Details</th>
                  <th className="p-4 lg:p-6 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-800/10 transition-all hover:bg-slate-500/5"
                  >
                    <td className="p-4 lg:p-6 text-blue-600 font-black uppercase text-[8px] lg:text-[10px]">
                      {log.action}
                    </td>
                    <td className="p-4 lg:p-6 font-bold text-[10px] lg:text-xs">
                      {log.details}
                    </td>
                    <td className="p-4 lg:p-6 text-[8px] lg:text-[10px] opacity-40 text-right">
                      {log.timestamp?.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LIBRARY SECTION */}
        {activeTab === "library" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {libraryLinks.map((lib, i) => (
              <a
                key={i}
                href={lib.url}
                target="_blank"
                rel="noreferrer"
                className={`p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border transition-all hover:-translate-y-2 ${isDarkMode ? "bg-slate-900 border-white/5 hover:border-blue-600" : "bg-white border-slate-200 shadow-xl hover:border-blue-600"}`}
              >
                <div className="text-[9px] lg:text-[10px] font-black text-blue-600 uppercase mb-2">
                  {lib.cat}
                </div>
                <h3 className="font-black text-base lg:text-xl mb-3 lg:mb-4">
                  {lib.name}
                </h3>
                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase text-slate-500">
                  Access <ExternalLink size={12} />
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .t-nav { width: 100%; display: flex; align-items: center; gap: 12px lg:15px; padding: 14px 20px lg:padding: 18px 25px; border-radius: 15px lg:20px; font-weight: 900; font-size: 10px lg:11px; text-transform: uppercase; color: #64748b; transition: 0.3s; border:none; background:none; cursor:pointer; }
        .t-active { background: #2563eb !important; color: white !important; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); }
        .s-input { width: 100%; padding: 1rem lg:1.25rem; background: ${isDarkMode ? "#1e293b" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem lg:1.5rem; font-weight: 800; font-size: 0.75rem lg:0.8rem; outline: none; transition: 0.3s; color: inherit; }
        .s-input:focus { border-color: #2563eb; background: ${isDarkMode ? "#0f172a" : "white"}; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
        .text-shadow-glow { text-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
      `}</style>
    </div>
  );
};

export default SupervisorDashboard;
