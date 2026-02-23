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
} from "lucide-react";

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [weeklyDates, setWeeklyDates] = useState({});
  const [globalNotice, setGlobalNotice] = useState("");
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] =
    useState("Web development");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatStudent, setSelectedChatStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [portalStatus, setPortalStatus] = useState(true);
  const [aiHistory, setAiHistory] = useState([]);

  const [pdfData, setPdfData] = useState({
    courseTitle: "Web development",
    weekNumber: "1",
    pdfUrl: "",
    materialTitle: "",
    description: "",
  });

  const [academicData, setAcademicData] = useState({
    type: "video",
    title: "",
    content: "",
    week: "1",
    course: "Web development",
    dueDate: "",
  });

  const [forumData, setForumData] = useState({
    title: "",
    content: "",
    course: "Web development",
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

  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
    comment: "",
  });

  // REAL-TIME DATA ENGINE (MASTER SYNC)
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "course_applications"),
      (snap) => {
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setSystemUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubServices = onSnapshot(
      collection(db, "service_requests"),
      (snap) => {
        setServiceRequests(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
    );

    const unsubForum = onSnapshot(
      query(collection(db, "forum_threads"), orderBy("createdAt", "desc")),
      (snap) => {
        setAllThreads(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubLessons = onSnapshot(
      query(collection(db, "lessons"), orderBy("createdAt", "desc")),
      (snap) => {
        setLessons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubLogs = onSnapshot(
      query(collection(db, "system_logs"), orderBy("timestamp", "desc")),
      (snap) => {
        setHistoryLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubPortal = onSnapshot(
      doc(db, "system_settings", "portal_control"),
      (snap) => {
        if (snap.exists()) setPortalStatus(snap.data().isOpen);
      },
    );

    const unsubAi = onSnapshot(
      query(collection(db, "ai_chat_history"), orderBy("createdAt", "desc")),
      (snap) => {
        setAiHistory(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    return () => {
      unsubStudents();
      unsubUsers();
      unsubServices();
      unsubForum();
      unsubLessons();
      unsubLogs();
      unsubPortal();
      unsubAi();
    };
  }, []);

  const logActivity = async (action, details) => {
    await addDoc(collection(db, "system_logs"), {
      action,
      details,
      admin: "SUPER_ADMIN",
      timestamp: serverTimestamp(),
    });
  };

  const handleDeployPDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "course_materials"), {
        ...pdfData,
        type: "PDF",
        deployedBy: "SUPER_ADMIN",
        createdAt: serverTimestamp(),
      });
      await logActivity("PDF_DEPLOY", `Dispatched ${pdfData.materialTitle}`);
      alert("SUCCESS: PDF deployed.");
      setPdfData({
        ...pdfData,
        pdfUrl: "",
        materialTitle: "",
        description: "",
      });
    } catch (err) {
      alert("ERROR: Deployment failed.");
    } finally {
      setLoading(false);
    }
  };

  const togglePortalStatus = async () => {
    setLoading(true);
    try {
      const newStatus = !portalStatus;
      await setDoc(
        doc(db, "system_settings", "portal_control"),
        { isOpen: newStatus },
        { merge: true },
      );
      await logActivity(
        "PORTAL_TOGGLE",
        `Portal set to ${newStatus ? "OPEN" : "LOCKED"}`,
      );
      alert(`SYSTEM: Portal is now ${newStatus ? "LIVE" : "LOCKED"}`);
    } catch (err) {
      alert("FAIL: Lockdown toggle error.");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = async (id, field, value) => {
    await updateDoc(doc(db, "course_applications", id), { [field]: value });
    await logActivity("ADMISSION_MOD", `Set ${field} to ${value} for ${id}`);
  };

  const handleLogout = async () => {
    if (window.confirm("Logout from Authority Terminal?")) {
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  // RENDERING COMPONENTS
  const renderStudentProfileModal = () => {
    if (!selectedStudentInfo) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 animate-in fade-in">
        <div
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-12 ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
        >
          <button
            onClick={() => setSelectedStudentInfo(null)}
            className="absolute top-8 right-8 p-3 bg-red-500 text-white rounded-2xl hover:bg-black transition-all"
          >
            <X />
          </button>
          <div className="flex flex-col md:flex-row gap-8 items-center border-b pb-10 mb-10">
            <img
              src={selectedStudentInfo.passportUrl}
              className="w-48 h-48 rounded-[2.5rem] object-cover border-4 border-blue-600"
              alt="Passport"
            />
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                {selectedStudentInfo.studentName}
              </h2>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase mt-4 inline-block">
                {selectedStudentInfo.course}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <Users size={16} /> Identity & Contact
              </h3>
              <div
                className={`p-6 rounded-3xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
              >
                <p className="text-sm font-bold">
                  Email: {selectedStudentInfo.email}
                </p>
                <p className="text-sm font-bold">
                  Phone: {selectedStudentInfo.phone}
                </p>
                <p className="text-sm font-bold">
                  Address: {selectedStudentInfo.address},{" "}
                  {selectedStudentInfo.currentState}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-emerald-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <School size={16} /> Education
              </h3>
              {selectedStudentInfo.educationBackground?.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-100 bg-slate-50/50"
                >
                  <p className="text-blue-600 font-black text-[10px] uppercase">
                    {edu.qualification}
                  </p>
                  <h4 className="font-bold text-sm">{edu.institution}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-[#0f172a] text-white" : "bg-[#f1f5f9] text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-72 p-8 space-y-10 shrink-0 border-r shadow-2xl ${darkMode ? "bg-[#1e293b] border-white/5" : "bg-[#0f172a] text-white"}`}
      >
        <div>
          <h2 className="text-2xl font-black italic text-blue-500 tracking-tighter">
            AYAX ADMIN
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">
            Authority Portal v2.0
          </p>
        </div>
        <nav className="space-y-2">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: <LayoutDashboard size={18} />,
            },
            { id: "students", label: "Admissions", icon: <Users size={18} /> },
            {
              id: "academic",
              label: "Curriculum",
              icon: <BookOpen size={18} />,
            },
            {
              id: "pdf_manager",
              label: "PDF Library",
              icon: <UploadCloud size={18} />,
            },
            {
              id: "global_forum",
              label: "Forum",
              icon: <MessageSquare size={18} />,
            },
            {
              id: "history",
              label: "System Logs",
              icon: <History size={18} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? "active-nav" : ""}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="nav-link text-red-400 mt-10"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full p-4 bg-white/5 rounded-2xl flex justify-center mt-auto"
        >
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-blue-400" />
          )}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div className="flex gap-4">
            <div className="stat-card bg-white">
              <p className="metric-label">Live Intake</p>
              <h3 className="text-2xl font-black">{students.length}</h3>
            </div>
            <div className="stat-card bg-white border-l-4 border-emerald-500">
              <p className="metric-label">Revenue</p>
              <h3 className="text-2xl font-black">
                ₦
                {(
                  students.filter((s) => s.paymentStatus === "Verified")
                    .length * 35000
                ).toLocaleString()}
              </h3>
            </div>
          </div>
          <button
            onClick={togglePortalStatus}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {portalStatus ? (
              <Lock size={14} className="inline mr-2" />
            ) : (
              <Unlock size={14} className="inline mr-2" />
            )}{" "}
            {portalStatus ? "Lock System" : "Open System"}
          </button>
        </header>

        {activeTab === "overview" && (
          <div
            className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${darkMode ? "bg-slate-800 border-white/5" : "bg-white"}`}
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50/5 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-6">Action</th>
                  <th className="p-6">Details</th>
                  <th className="p-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {historyLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-blue-500/5">
                    <td className="p-6">
                      <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-medium">{log.details}</td>
                    <td className="p-6 text-[10px] opacity-40">
                      {log.timestamp?.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div
            className={`rounded-[3rem] shadow-xl border overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50/5 border-b text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-6">Applicant</th>
                  <th className="p-6">Course</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-500/5 transition-all">
                    <td className="p-6 flex items-center gap-4">
                      <img
                        src={s.passportUrl}
                        className="w-12 h-12 rounded-2xl object-cover"
                        alt="Student"
                      />
                      <div>
                        <p className="font-black text-sm">{s.studentName}</p>
                        <p className="text-[10px] opacity-50">{s.email}</p>
                      </div>
                    </td>
                    <td className="p-6 font-black text-blue-600 text-xs uppercase">
                      {s.course}
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === "Admitted" ? "bg-green-500 text-white" : "bg-amber-100 text-amber-600"}`}
                      >
                        {s.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-6 flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedStudentInfo(s)}
                        className="p-3 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          updateStudentStatus(s.id, "status", "Admitted")
                        }
                        className="p-3 bg-emerald-500 text-white rounded-xl"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Purge student record?"))
                            await deleteDoc(
                              doc(db, "course_applications", s.id),
                            );
                        }}
                        className="p-3 bg-red-50 text-red-500 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "pdf_manager" && (
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 max-w-3xl">
            <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <UploadCloud className="text-blue-600" /> Deploy Course PDF
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
                placeholder="Material Title"
                className="admin-input"
                value={pdfData.materialTitle}
                onChange={(e) =>
                  setPdfData({ ...pdfData, materialTitle: e.target.value })
                }
              />
              <input
                placeholder="PDF Link (Cloud/Drive URL)"
                className="admin-input"
                value={pdfData.pdfUrl}
                onChange={(e) =>
                  setPdfData({ ...pdfData, pdfUrl: e.target.value })
                }
              />
              <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">
                Submit Weekly Material
              </button>
            </form>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {historyLogs.map((log) => (
              <div
                key={log.id}
                className="p-6 bg-white rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
                    {log.action}
                  </p>
                  <p className="font-bold text-sm">{log.details}</p>
                </div>
                <p className="text-[10px] font-black opacity-30">
                  {log.timestamp?.toDate().toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {renderStudentProfileModal()}

      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 25px; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white !important; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); }
        .stat-card { padding: 25px; border-radius: 25px; display: flex; flex-direction: column; gap: 5px; min-width: 160px; border: 1px solid rgba(0,0,0,0.05); }
        .metric-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; font-size: 0.85rem; outline: none; transition: 0.3s; color: ${darkMode ? "white" : "black"}; }
        .admin-input:focus { border-color: #2563eb; background: ${darkMode ? "#1e293b" : "white"}; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;
