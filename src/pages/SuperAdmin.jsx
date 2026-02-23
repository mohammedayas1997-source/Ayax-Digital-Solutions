import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  Save,
  AlertOctagon,
  BellRing,
  Users,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  CheckCircle,
  Trash2,
  Award,
  Globe,
  UserPlus,
  Eye,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  ShieldCheck,
  XCircle,
  Activity,
  ShieldAlert,
  Search,
  Video,
  FileText,
  ClipboardList,
  PlusCircle,
  Moon,
  Sun,
  LogOut,
  History,
  UploadCloud,
  Unlock,
  Lock,
  School,
  X,
  Mail,
  TrendingUp,
  Zap,
  Info,
} from "lucide-react";

const SuperAdmin = () => {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChatStudent, setSelectedChatStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [portalStatus, setPortalStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Curriculum & Calendar States
  const [weeklyDates, setWeeklyDates] = useState({});
  const [globalNotice, setGlobalNotice] = useState("");
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] =
    useState("Web development");

  // Form States
  const [pdfData, setPdfData] = useState({
    courseTitle: "Web development",
    weekNumber: "1",
    pdfUrl: "",
    materialTitle: "",
    description: "",
  });

  const availableCourses = [
    "Cyber security",
    "Data Analytics",
    "Software Engineering",
    "Artificial Intelligence",
    "Blockchain Technology",
    "Web development",
    "advanced Digital Marketing",
  ];

  // --- REAL-TIME ENGINE ---
  useEffect(() => {
    // 1. Dual Enrollment Sync (Fix for missing forms)
    const unsubEnroll = onSnapshot(collection(db, "enrollments"), (snap) => {
      const enrollData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        source: "enrollments",
      }));
      setStudents((prev) => {
        const filtered = prev.filter((s) => s.source !== "enrollments");
        return [...filtered, ...enrollData];
      });
    });

    const unsubApps = onSnapshot(
      collection(db, "course_applications"),
      (snap) => {
        const appData = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          source: "course_applications",
        }));
        setStudents((prev) => {
          const filtered = prev.filter(
            (s) => s.source !== "course_applications",
          );
          return [...filtered, ...appData];
        });
      },
    );

    // 2. System Monitoring
    const unsubLogs = onSnapshot(
      query(collection(db, "system_logs"), orderBy("timestamp", "desc")),
      (snap) => {
        setHistoryLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    const unsubAi = onSnapshot(
      query(collection(db, "ai_chat_history"), orderBy("createdAt", "desc")),
      (snap) => {
        setAiHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    const unsubPortal = onSnapshot(
      doc(db, "system_settings", "portal_control"),
      (snap) => {
        if (snap.exists()) setPortalStatus(snap.data().isOpen);
      },
    );

    // 3. Private Chat Surveillance
    const unsubChats = onSnapshot(
      query(collection(db, "private_chats"), orderBy("createdAt", "desc")),
      (snap) => {
        const allMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const threads = [];
        const seen = new Set();
        allMsgs.forEach((m) => {
          if (!seen.has(m.studentId)) {
            seen.add(m.studentId);
            threads.push(m);
          }
        });
        setChats(threads);
      },
    );

    return () => {
      unsubEnroll();
      unsubApps();
      unsubLogs();
      unsubAi();
      unsubPortal();
      unsubChats();
    };
  }, []);

  // Chat Messages Listener
  useEffect(() => {
    if (!selectedChatStudent) return;
    const q = query(
      collection(db, "private_chats"),
      where("studentId", "==", selectedChatStudent.id),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedChatStudent]);

  // --- ACTIONS ---
  const logActivity = async (action, details) => {
    await addDoc(collection(db, "system_logs"), {
      action,
      details,
      admin: "SUPER_ADMIN",
      timestamp: serverTimestamp(),
    });
  };

  const updateStudentStatus = async (id, source, field, value) => {
    const colName =
      source === "enrollments" ? "enrollments" : "course_applications";
    await updateDoc(doc(db, colName, id), { [field]: value });
    logActivity("ADMISSION_UPDATE", `Student ${id} status set to ${value}`);
    alert("Record Updated.");
  };

  const handleDeployPDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "course_materials"), {
        ...pdfData,
        createdAt: serverTimestamp(),
      });
      logActivity("PDF_DEPLOY", `Material: ${pdfData.materialTitle}`);
      alert("Material Deployed.");
      setPdfData({ ...pdfData, pdfUrl: "", materialTitle: "" });
    } catch (err) {
      alert("Deployment error.");
    } finally {
      setLoading(false);
    }
  };

  const togglePortalStatus = async () => {
    const newStatus = !portalStatus;
    await setDoc(
      doc(db, "system_settings", "portal_control"),
      { isOpen: newStatus },
      { merge: true },
    );
    logActivity("PORTAL_SECURITY", `Portal state: ${newStatus}`);
  };

  const handleLogout = async () => {
    if (window.confirm("Terminate Session?")) {
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  // --- RENDER COMPONENTS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <Users size={24} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">
            Total Applicants
          </p>
          <h3 className="text-3xl font-black mt-1">{students.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-200">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">
            Revenue Stream
          </p>
          <h3 className="text-3xl font-black mt-1">
            ₦{(students.length * 35000).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-200">
            <Activity size={24} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">
            System State
          </p>
          <h3 className="text-3xl font-black mt-1">Active</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div
            className={`w-12 h-12 ${portalStatus ? "bg-indigo-600" : "bg-red-600"} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}
          >
            {portalStatus ? <Unlock size={24} /> : <Lock size={24} />}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">
            Portal Security
          </p>
          <h3 className="text-3xl font-black mt-1">
            {portalStatus ? "Open" : "Locked"}
          </h3>
        </div>
      </div>

      {/* Real-time Activity Logs */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black uppercase italic text-sm tracking-tighter">
            System Audit Trail
          </h3>
          <History size={20} className="text-slate-400" />
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
              <tr>
                <th className="p-6">Action</th>
                <th className="p-6">Details</th>
                <th className="p-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/50">
                  <td className="p-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[9px] font-black">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600">
                    {log.details}
                  </td>
                  <td className="p-6 text-[10px] opacity-40 font-black">
                    {log.timestamp?.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudentProfile = () => {
    if (!selectedStudentInfo) return null;
    const s = selectedStudentInfo;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-8 overflow-y-auto">
        <div
          className={`relative w-full max-w-6xl rounded-[4rem] shadow-2xl p-12 ${darkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <button
            onClick={() => setSelectedStudentInfo(null)}
            className="absolute top-10 right-10 p-4 bg-red-600 text-white rounded-full hover:rotate-90 transition-all"
          >
            <X size={32} />
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="relative group">
              <img
                src={s.passportUrl || "https://via.placeholder.com/300"}
                className="w-80 h-80 rounded-[4rem] object-cover border-8 border-blue-600 shadow-2xl transition-all group-hover:scale-105"
                alt="Profile"
              />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl italic">
                Verified Candidate
              </div>
            </div>

            <div className="flex-1 space-y-10 w-full">
              <div className="border-b pb-8">
                <h2 className="text-6xl font-black uppercase italic tracking-tighter text-blue-600">
                  {s.studentName || s.name}
                </h2>
                <div className="flex gap-4 mt-4">
                  <span className="px-5 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {s.course || s.courseId}
                  </span>
                  <span className="px-5 py-2 bg-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    {s.paymentStatus || "Paid"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-blue-600">
                    <Mail size={20} />
                    <p className="font-bold">{s.email || s.studentEmail}</p>
                  </div>
                  <div className="flex items-center gap-4 text-blue-600">
                    <Phone size={20} />
                    <p className="font-bold">{s.phone || s.studentPhone}</p>
                  </div>
                  <div className="flex items-center gap-4 text-blue-600">
                    <Globe size={20} />
                    <p className="font-bold">{s.address || "No Address"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">
                    Academic Credentials
                  </h4>
                  {s.educationBackground ? (
                    s.educationBackground.map((edu, i) => (
                      <div
                        key={i}
                        className="mb-4 border-l-4 border-blue-600 pl-4"
                      >
                        <p className="text-xs font-black uppercase">
                          {edu.qualification}
                        </p>
                        <p className="text-[10px] font-bold opacity-60 italic">
                          {edu.institution}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-bold opacity-40">Not Provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChatMonitor = () => (
    <div className="flex gap-6 h-[75vh] animate-in fade-in duration-500">
      <div className="w-1/3 bg-white p-6 rounded-[3rem] border shadow-xl flex flex-col">
        <div className="mb-6 px-4 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
            <Eye size={16} /> Live Audit
          </h3>
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {chats.map((chat) => (
            <div
              key={chat.studentId}
              onClick={() =>
                setSelectedChatStudent({
                  id: chat.studentId,
                  name: chat.sender,
                })
              }
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${selectedChatStudent?.id === chat.studentId ? "bg-red-600 text-white border-red-600 shadow-xl" : "bg-slate-50 hover:bg-white border-transparent"}`}
            >
              <p className="font-black text-[11px] uppercase italic">
                {chat.sender}
              </p>
              <p className="text-[9px] truncate opacity-60 font-bold mt-1">
                {chat.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white rounded-[3rem] border shadow-2xl flex flex-col overflow-hidden">
        {selectedChatStudent ? (
          <>
            <header className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h4 className="font-black text-xl italic uppercase text-slate-900">
                  {selectedChatStudent.name}
                </h4>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                  Surveillance Mode
                </p>
              </div>
              <button
                onClick={() => setSelectedChatStudent(null)}
                className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </header>
            <div className="flex-1 p-8 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.senderRole === "student" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`p-5 rounded-[2rem] text-xs font-bold max-w-[70%] shadow-sm ${m.senderRole === "student" ? "bg-white text-slate-800" : "bg-red-600 text-white"}`}
                  >
                    {m.text}
                    <p className="text-[8px] mt-2 opacity-40 uppercase">
                      {m.createdAt?.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="m-auto text-center opacity-10 flex flex-col items-center">
            <ShieldAlert size={100} />
            <p className="text-xl font-black uppercase tracking-widest mt-4">
              Security Selection Required
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`flex min-h-screen font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-slate-950"}`}
    >
      {/* SIDEBAR */}
      <div className="w-72 bg-[#0f172a] p-8 shrink-0 flex flex-col border-r border-white/5 shadow-2xl">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/20 mb-4 font-black text-2xl">
            AX
          </div>
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
            Ayax OS
          </h2>
          <div className="inline-block px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase text-blue-400 tracking-widest mt-2">
            V2.4 Production
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            {
              id: "overview",
              label: "Dashboard",
              icon: <LayoutDashboard size={18} />,
            },
            { id: "students", label: "Admissions", icon: <Users size={18} /> },
            {
              id: "chat_monitor",
              label: "Surveillance",
              icon: <Eye size={18} />,
            },
            {
              id: "ai_surveillance",
              label: "AI Intel",
              icon: <ShieldCheck size={18} />,
            },
            {
              id: "pdf_manager",
              label: "Curriculum",
              icon: <UploadCloud size={18} />,
            },
            { id: "history", label: "Audit Logs", icon: <History size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? "active-nav" : "text-slate-500 hover:text-white"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="nav-link text-slate-500 hover:text-white"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />} Mode Shift
          </button>
          <button onClick={handleLogout} className="nav-link text-red-500">
            <LogOut size={18} /> Shutdown
          </button>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen relative custom-scrollbar">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {students.slice(0, 5).map((s) => (
                <img
                  key={s.id}
                  src={s.passportUrl}
                  className="w-10 h-10 rounded-full border-4 border-slate-50 object-cover"
                />
              ))}
              <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-white">
                +{students.length}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                Command Authority
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-time Node Monitoring
              </p>
            </div>
          </div>
          <button
            onClick={togglePortalStatus}
            className={`px-10 py-4 rounded-3xl font-black text-[10px] uppercase shadow-2xl transition-all active:scale-95 ${portalStatus ? "bg-red-600 text-white shadow-red-200" : "bg-emerald-600 text-white shadow-emerald-200"}`}
          >
            {portalStatus ? (
              <Lock size={14} className="inline mr-2" />
            ) : (
              <Unlock size={14} className="inline mr-2" />
            )}{" "}
            {portalStatus ? "Engage Lockdown" : "Initiate Access"}
          </button>
        </header>

        {activeTab === "overview" && renderOverview()}

        {activeTab === "students" && (
          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-8">Candidate</th>
                  <th className="p-8">Specialization</th>
                  <th className="p-8">Status</th>
                  <th className="p-8 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/50 transition-all group"
                  >
                    <td className="p-8 flex items-center gap-5">
                      <img
                        src={s.passportUrl || "https://via.placeholder.com/150"}
                        className="w-14 h-14 rounded-[1.5rem] object-cover ring-4 ring-blue-600/10 shadow-lg group-hover:scale-110 transition-all"
                      />
                      <div>
                        <p className="text-sm uppercase font-black">
                          {s.studentName || s.name}
                        </p>
                        <p className="text-[10px] text-slate-400 lowercase">
                          {s.email || s.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-8 text-[11px] text-blue-600 uppercase font-black italic">
                      {s.course || s.courseId}
                    </td>
                    <td className="p-8">
                      <span
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase ${s.status === "Admitted" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-amber-100 text-amber-600"}`}
                      >
                        {s.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-8 flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedStudentInfo(s)}
                        className="p-4 bg-slate-950 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() =>
                          updateStudentStatus(
                            s.id,
                            s.source,
                            "status",
                            "Admitted",
                          )
                        }
                        className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Purge?"))
                            await deleteDoc(doc(db, s.source, s.id));
                        }}
                        className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "chat_monitor" && renderChatMonitor()}

        {activeTab === "ai_surveillance" && (
          <div className="grid grid-cols-1 gap-4 max-w-4xl custom-scrollbar overflow-y-auto max-h-[75vh]">
            {aiHistory.map((log) => (
              <div
                key={log.id}
                className={`p-8 rounded-[3rem] border shadow-sm ${log.role === "user" ? "bg-white border-slate-100" : "bg-blue-600/5 border-blue-600/10"}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                    {log.role === "user"
                      ? log.userEmail || "Node Input"
                      : "AI Core Intelligence"}
                  </p>
                  <p className="text-[9px] font-black opacity-30">
                    {log.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
                <p
                  className={`text-sm leading-relaxed ${log.role === "user" ? "text-slate-600 font-medium" : "text-slate-900 font-black italic"}`}
                >
                  {log.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "pdf_manager" && (
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto text-center">
            <UploadCloud size={60} className="text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-black uppercase italic italic mb-10">
              Curriculum Deployment
            </h3>
            <form onSubmit={handleDeployPDF} className="space-y-6">
              <select
                className="admin-input"
                value={pdfData.courseTitle}
                onChange={(e) =>
                  setPdfData({ ...pdfData, courseTitle: e.target.value })
                }
              >
                {availableCourses.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                className="admin-input"
                placeholder="Document Title"
                value={pdfData.materialTitle}
                onChange={(e) =>
                  setPdfData({ ...pdfData, materialTitle: e.target.value })
                }
                required
              />
              <input
                className="admin-input"
                placeholder="Cloud Storage URL (PDF)"
                value={pdfData.pdfUrl}
                onChange={(e) =>
                  setPdfData({ ...pdfData, pdfUrl: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all"
              >
                Broadcast Material
              </button>
            </form>
          </div>
        )}
      </div>

      {renderStudentProfile()}

      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 25px; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white !important; shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); }
        .admin-input { width: 100%; padding: 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-weight: 800; outline: none; transition: 0.3s; font-size: 0.8rem; text-transform: uppercase; }
        .admin-input:focus { border-color: #2563eb; background: white; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;
