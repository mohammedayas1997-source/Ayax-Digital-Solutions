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

  // REAL-TIME DATA ENGINE (MASTER RESTORATION)
  useEffect(() => {
    // SYNC 1: New Enrollments Fix
    const unsubEnroll = onSnapshot(collection(db, "enrollments"), (snap) => {
      const enrollData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: "enrollments",
      }));
      setStudents((prev) => {
        const filtered = prev.filter((s) => s.source !== "enrollments");
        return [...filtered, ...enrollData];
      });
    });

    // SYNC 2: Legacy Applications
    const unsubApps = onSnapshot(
      collection(db, "course_applications"),
      (snap) => {
        const appData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

    const unsubSchedule = onSnapshot(
      doc(db, "course_schedules", selectedCourseForSchedule),
      (docSnap) => {
        if (docSnap.exists()) {
          setWeeklyDates(docSnap.data().weeks || {});
          setGlobalNotice(docSnap.data().globalNotice || "");
        } else {
          setWeeklyDates({});
          setGlobalNotice("");
        }
      },
    );

    const unsubChats = onSnapshot(
      query(collection(db, "private_chats"), orderBy("createdAt", "desc")),
      (snap) => {
        const allMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const uniqueThreads = [];
        const seen = new Set();
        allMsgs.forEach((m) => {
          if (!seen.has(m.studentId)) {
            seen.add(m.studentId);
            uniqueThreads.push(m);
          }
        });
        setChats(uniqueThreads);
      },
    );

    return () => {
      unsubEnroll();
      unsubApps();
      unsubUsers();
      unsubServices();
      unsubForum();
      unsubLessons();
      unsubLogs();
      unsubPortal();
      unsubAi();
      unsubSchedule();
      unsubChats();
    };
  }, [selectedCourseForSchedule]);

  // Restored Functions
  const logActivity = async (action, details) => {
    await addDoc(collection(db, "system_logs"), {
      action,
      details,
      admin: "SUPER_ADMIN",
      timestamp: serverTimestamp(),
    });
  };

  const updateWeekDate = (week, val) => {
    setWeeklyDates((prev) => ({ ...prev, [week]: val }));
  };

  const handleUpdateSchedule = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "course_schedules", selectedCourseForSchedule),
        {
          weeks: weeklyDates,
          globalNotice,
          lastUpdatedBy: "SUPER_ADMIN",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert("COMMAND EXECUTED: Academic calendar synced.");
    } catch (err) {
      alert("Error syncing schedule.");
    } finally {
      setLoading(false);
    }
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
      alert("PDF Deployed Successfully.");
      setPdfData({
        ...pdfData,
        pdfUrl: "",
        materialTitle: "",
        description: "",
      });
    } catch (err) {
      alert("Deployment failed.");
    } finally {
      setLoading(false);
    }
  };

  const issueManualCertificate = async (studentUid) => {
    setLoading(true);
    try {
      const manualSerial = `AYX-MAN-2026-${Date.now().toString().slice(-6)}`;
      await updateDoc(doc(db, "users", studentUid), {
        certificateId: manualSerial,
        manualIssuance: true,
        issuedAt: new Date().toISOString(),
      });
      alert(`Issued Serial: ${manualSerial}`);
    } catch (error) {
      alert("Issuance failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = async (id, source, field, value) => {
    const colName =
      source === "enrollments" ? "enrollments" : "course_applications";
    await updateDoc(doc(db, colName, id), { [field]: value });
    alert("Record Synced.");
  };

  const togglePortalStatus = async () => {
    const newStatus = !portalStatus;
    await setDoc(
      doc(db, "system_settings", "portal_control"),
      { isOpen: newStatus },
      { merge: true },
    );
    alert(`System Access: ${newStatus ? "OPEN" : "LOCKED"}`);
  };

  const handleLogout = async () => {
    if (window.confirm("Terminate Admin Session?")) {
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  // FULL UI RENDERING
  const renderStudentProfileModal = () => {
    if (!selectedStudentInfo) return null;
    const s = selectedStudentInfo;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
        <div
          className={`relative w-full max-w-5xl rounded-[4rem] shadow-2xl p-12 overflow-y-auto max-h-[90vh] ${darkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <button
            onClick={() => setSelectedStudentInfo(null)}
            className="absolute top-10 right-10 p-4 bg-red-600 text-white rounded-full"
          >
            <X size={32} />
          </button>
          <div className="flex flex-col lg:flex-row gap-12 items-center border-b pb-10">
            <img
              src={s.passportUrl || "https://via.placeholder.com/200"}
              className="w-64 h-64 rounded-[3.5rem] object-cover border-8 border-blue-600 shadow-2xl"
              alt="Profile"
            />
            <div className="flex-1">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-blue-600">
                {s.studentName || s.name}
              </h2>
              <div className="grid grid-cols-2 gap-8 mt-10">
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Personal Info
                  </p>
                  <p className="font-bold text-sm mt-2">
                    Email: {s.email || s.studentEmail}
                  </p>
                  <p className="font-bold text-sm">
                    Phone: {s.phone || s.studentPhone}
                  </p>
                  <p className="font-bold text-sm">
                    Address: {s.address || "N/A"}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Academic Background
                  </p>
                  {s.educationBackground ? (
                    s.educationBackground.map((edu, idx) => (
                      <div
                        key={idx}
                        className="mt-2 border-l-4 border-blue-500 pl-3"
                      >
                        <p className="text-xs font-black uppercase">
                          {edu.qualification}
                        </p>
                        <p className="text-[10px] font-bold opacity-60">
                          {edu.institution}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs opacity-40">No records.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-screen font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-[#f1f5f9] text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-72 p-8 shrink-0 border-r ${darkMode ? "bg-slate-900 border-white/5" : "bg-[#0f172a] text-white"}`}
      >
        <h2 className="text-2xl font-black italic text-blue-500 uppercase tracking-tighter mb-10">
          Ayax Authority
        </h2>
        <nav className="space-y-1">
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
            { id: "schedule", label: "Calendar", icon: <Calendar size={18} /> },
            {
              id: "pdf_manager",
              label: "PDF Library",
              icon: <UploadCloud size={18} />,
            },
            { id: "history", label: "Audit Logs", icon: <History size={18} /> },
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
            <LogOut size={18} /> Terminal Off
          </button>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="stat-card bg-white">
            <p className="metric-label">Live Registry</p>
            <h3 className="text-3xl font-black">{students.length}</h3>
          </div>
          <button
            onClick={togglePortalStatus}
            className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {portalStatus ? (
              <Lock size={14} className="inline mr-2" />
            ) : (
              <Unlock size={14} className="inline mr-2" />
            )}{" "}
            {portalStatus ? "System Locked" : "System Live"}
          </button>
        </header>

        {activeTab === "students" && (
          <div className="bg-white rounded-[3.5rem] shadow-2xl border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-8">Subject Identity</th>
                  <th className="p-8">Course</th>
                  <th className="p-8">Status</th>
                  <th className="p-8 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/50">
                    <td className="p-8 flex items-center gap-4">
                      <img
                        src={s.passportUrl || "https://via.placeholder.com/150"}
                        className="w-14 h-14 rounded-2xl object-cover ring-4 ring-blue-600/10"
                        alt=""
                      />
                      <div>
                        <p className="text-sm uppercase font-black">
                          {s.studentName || s.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {s.email || s.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-8 text-[10px] text-blue-600 uppercase font-black">
                      {s.course || s.courseId}
                    </td>
                    <td className="p-8">
                      <span
                        className={`px-4 py-1 rounded-lg text-[9px] uppercase font-black ${s.status === "Admitted" ? "bg-green-600 text-white" : "bg-amber-100 text-amber-600"}`}
                      >
                        {s.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-8 flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedStudentInfo(s)}
                        className="p-4 bg-slate-900 text-white rounded-2xl"
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
                        className="p-4 bg-emerald-500 text-white rounded-2xl"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic">
                  Academic Command
                </h2>
                <p className="text-[10px] font-bold text-blue-400 tracking-[0.3em]">
                  Course: {selectedCourseForSchedule}
                </p>
              </div>
              <button
                onClick={handleUpdateSchedule}
                className="px-8 py-3 bg-blue-600 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg"
              >
                <Save size={16} /> Sync Calendar
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i + 1}
                  className="p-6 bg-white rounded-3xl border shadow-sm flex flex-col gap-3"
                >
                  <span className="font-black italic text-gray-900">
                    Week {i + 1}
                  </span>
                  <input
                    className="admin-input py-2 text-[10px]"
                    placeholder="Set Date"
                    value={weeklyDates[i + 1] || ""}
                    onChange={(e) => updateWeekDate(i + 1, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... Rest of tabs: overview, pdf_manager, history ... */}
      </div>
      {renderStudentProfileModal()}
      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 20px 25px; border-radius: 24px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white !important; shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4); }
        .stat-card { padding: 30px; border-radius: 35px; border: 1px solid rgba(0,0,0,0.05); }
        .metric-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
        .admin-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-weight: 700; outline: none; transition: 0.3s; }
        .admin-input:focus { border-color: #2563eb; background: white; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;
