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
  Fingerprint,
  Wallet,
  TrendingUp,
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
  School,
  User,
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

  // Metrics Logic - Kudin Form 5k, Kudin Makaranta 50k
  const formPaidCount = students.filter(
    (s) => s.paymentStatus === "Form_Paid",
  ).length;
  const tuitionPaidCount = students.filter(
    (s) => s.paymentStatus === "Verified",
  ).length;
  const idGeneratedCount = students.filter((s) => s.studentId).length;
  const awaitingIdCount = students.filter(
    (s) => s.paymentStatus === "Form_Paid" && !s.studentId,
  ).length;
  const totalRevenue = formPaidCount * 5000 + tuitionPaidCount * 50000;

  // Academic States
  const [lessons, setLessons] = useState([]);
  const [weeklyDates, setWeeklyDates] = useState({});
  const [globalNotice, setGlobalNotice] = useState("");
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] =
    useState("Web development");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);

  // Chat Monitor States
  const [chats, setChats] = useState([]);
  const [selectedChatStudent, setSelectedChatStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState("");

  // PDF & Material States
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

  // REAL-TIME DATA ENGINE (Firebase Listeners)
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

    const unsubSchedule = onSnapshot(
      doc(db, "course_schedules", selectedCourseForSchedule),
      (docSnap) => {
        if (docSnap.exists()) {
          setWeeklyDates(docSnap.data().weeks || {});
          setGlobalNotice(docSnap.data().globalNotice || "");
        }
      },
    );

    return () => {
      unsubStudents();
      unsubUsers();
      unsubServices();
      unsubForum();
      unsubLessons();
      unsubLogs();
      unsubSchedule();
    };
  }, [selectedCourseForSchedule]);
  // 1. System Logging Protocol
  const logActivity = async (action, details) => {
    await addDoc(collection(db, "system_logs"), {
      action,
      details,
      admin: "SUPER_ADMIN",
      timestamp: serverTimestamp(),
    });
  };

  // 2. Material & PDF Deployment
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
      await logActivity(
        "PDF_DEPLOYMENT",
        `Dispatched ${pdfData.materialTitle} for Week ${pdfData.weekNumber}`,
      );
      alert(`SUCCESS: Week ${pdfData.weekNumber} PDF deployed.`);
      setPdfData({
        ...pdfData,
        pdfUrl: "",
        materialTitle: "",
        description: "",
      });
    } catch (err) {
      alert("CRITICAL ERROR: Deployment failed.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Manual Certificate Issuance Override
  const issueManualCertificate = async (studentUid) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", studentUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
        const manualSerial = `AYX-MAN-2026-${timestamp}-${randomStr}`;
        await updateDoc(userRef, {
          certificateId: manualSerial,
          manualIssuance: true,
          issuedAt: new Date().toISOString(),
        });
        alert(`SUCCESS: Certificate Issued - ${manualSerial}`);
      }
    } catch (error) {
      alert("CRITICAL ERROR: Manual Issuance Failed.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Academic Calendar & Exam Sync
  const handleUpdateSchedule = async () => {
    setLoading(true);
    try {
      const scheduleRef = doc(
        db,
        "course_schedules",
        selectedCourseForSchedule,
      );
      await setDoc(
        scheduleRef,
        {
          weeks: weeklyDates,
          globalNotice: globalNotice,
          lastUpdatedBy: "SUPER_ADMIN",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await logActivity(
        "CALENDAR_SYNC",
        `Updated protocol for ${selectedCourseForSchedule}`,
      );
      alert("COMMAND EXECUTED: Schedule Synchronized.");
    } catch (err) {
      alert("ERROR: Sync Failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateWeekDate = (week, val) => {
    setWeeklyDates((prev) => ({ ...prev, [week]: val }));
  };

  // 5. Student & User Management Actions
  const updateStudentStatus = async (id, field, value) => {
    const studentRef = doc(db, "course_applications", id);
    await updateDoc(studentRef, { [field]: value });
    await logActivity(
      "UPDATE",
      `Modified ${field} to ${value} for student ${id}`,
    );
    alert(`ADMIN PROTOCOL: ${field} Verified.`);
  };

  const deleteUser = async (id) => {
    if (window.confirm("CRITICAL: Permanent revocation of access. Proceed?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        await logActivity("DELETE", `Revoked access for user: ${id}`);
      } catch (err) {
        alert("ERROR: System could not delete record.");
      }
    }
  };

  // 6. Curriculum Deployment Logic
  const handleAcademicUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "lessons"), {
        ...academicData,
        instructor: "SUPER_ADMIN",
        createdAt: serverTimestamp(),
        isGradable:
          academicData.type === "exam" || academicData.type === "assignment",
      });
      await logActivity(
        "ACADEMIC",
        `Deployed ${academicData.type}: ${academicData.title}`,
      );
      alert(`SUCCESS: Deployed to ${academicData.course}`);
      setAcademicData({ ...academicData, title: "", content: "", dueDate: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  // 7. Master Chat Monitor Stream & Real-time Listeners
  useEffect(() => {
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

    const unsubSelectedChat = () => {
      if (!selectedChatStudent) return;
      const q = query(
        collection(db, "private_chats"),
        where("studentId", "==", selectedChatStudent.id),
        orderBy("createdAt", "asc"),
      );
      return onSnapshot(q, (snap) => {
        setChatMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    };

    const cleanupChat = unsubSelectedChat();
    return () => {
      unsubChats();
      if (cleanupChat) cleanupChat();
    };
  }, [selectedChatStudent]);

  // 8. Global Forum Interactions
  const handleCreateForum = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "forum_threads"), {
        ...forumData,
        studentName: "SUPER_ADMIN",
        role: "authority",
        createdAt: serverTimestamp(),
      });
      await logActivity(
        "FORUM",
        `Started official discussion: ${forumData.title}`,
      );
      alert("OFFICIAL: Discussion thread launched successfully.");
      setForumData({ title: "", content: "", course: "Web development" });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) return;
    try {
      await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
        text: adminReply,
        sender: "SUPER_ADMIN",
        role: "authority",
        createdAt: serverTimestamp(),
      });
      setAdminReply("");
      alert("AUTHORITY_RESPONSE: Message injected into forum.");
    } catch (err) {
      alert("Failed to inject response.");
    }
  };

  // 9. User Creation & WhatsApp Notification Protocol
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUserRef = await addDoc(collection(db, "users"), {
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        comment: userData.comment,
        createdAt: serverTimestamp(),
        status: "active",
        currentActivity: "Just Joined",
      });

      await logActivity(
        "USER_CREATION",
        `Created new ${userData.role}: ${userData.email}`,
      );

      // WhatsApp API Integration
      const message =
        `*OFFICIAL ADMISSION NOTICE - AYAX ACADEMY*\n\n` +
        `Hello *${userData.name}*,\nYour official account has been provisioned.\n\n` +
        `*ACCESS CREDENTIALS:*\nIdentifier: ${userData.email}\nSecurity Key: ${userData.password}\nRole: ${userData.role.toUpperCase()}\n\n` +
        `_Please login and update your credentials immediately._`;

      window.open(
        `https://wa.me/${userData.phone.replace("+", "")}?text=${encodeURIComponent(message)}`,
        "_blank",
      );

      setUserData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "student",
        comment: "",
      });
      alert("USER PROVISIONED: Credentials dispatched via WhatsApp.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  // 10. The Monitor Interface (Surveillance & Metrics)
  const renderChatMonitor = () => (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700">
      {/* Metrics Widgets Inside Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-[2.5rem] border-2 border-dashed border-purple-500/20 flex items-center gap-4 ${darkMode ? "bg-slate-900" : "bg-white shadow-xl"}`}
        >
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Fingerprint size={24} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">
              IDs Dispatched
            </p>
            <h2 className="text-lg font-black text-purple-500">
              {idGeneratedCount} Students
            </h2>
            {awaitingIdCount > 0 && (
              <p className="text-[7px] font-bold text-amber-500 animate-pulse">
                {awaitingIdCount} Awaiting ID
              </p>
            )}
          </div>
        </div>
        <div
          className={`p-6 rounded-[2.5rem] border-2 border-dashed border-amber-500/20 flex items-center gap-4 ${darkMode ? "bg-slate-900" : "bg-white shadow-xl"}`}
        >
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase opacity-40">
              Tuition Verified
            </p>
            <h2 className="text-lg font-black text-amber-500">
              {tuitionPaidCount} Students
            </h2>
            <p className="text-[7px] font-bold opacity-50 italic">
              Rate: ₦50,000 per student
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[75vh]">
        {/* Student List Sidebar */}
        <div
          className={`w-1/3 p-6 rounded-[2.5rem] border shadow-xl flex flex-col ${darkMode ? "bg-slate-800 border-white/5" : "bg-white"}`}
        >
          <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
            <Eye size={16} className="text-red-500" /> Private Surveillance
          </h3>
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />
            <input
              className="admin-input pl-10"
              placeholder="Search Student..."
              onChange={(e) => setChatSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {chats
              .filter((c) =>
                c.sender.toLowerCase().includes(chatSearch.toLowerCase()),
              )
              .map((chat) => (
                <div
                  key={chat.studentId}
                  onClick={() =>
                    setSelectedChatStudent({
                      id: chat.studentId,
                      name: chat.sender,
                    })
                  }
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedChatStudent?.id === chat.studentId ? "bg-red-600 border-red-600 text-white shadow-lg" : "hover:bg-gray-50 border-transparent text-slate-500"}`}
                >
                  <p className="font-black text-[11px] uppercase">
                    {chat.sender}
                  </p>
                  <p
                    className={`text-[9px] truncate mt-1 ${selectedChatStudent?.id === chat.studentId ? "text-white/70" : "text-gray-400"}`}
                  >
                    {chat.text}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Live Chat Viewport */}
        <div
          className={`flex-1 rounded-[2.5rem] border shadow-2xl flex flex-col overflow-hidden ${darkMode ? "bg-slate-800 border-white/5" : "bg-white"}`}
        >
          {selectedChatStudent ? (
            <>
              <header className="p-6 border-b flex justify-between items-center bg-gray-50/30">
                <div>
                  <h4 className="font-black text-lg italic uppercase">
                    {selectedChatStudent.name}
                  </h4>
                  <p className="text-[9px] font-black text-red-500 uppercase">
                    Monitoring Live Session
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChatStudent(null)}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                >
                  <X size={18} />
                </button>
              </header>
              <div className="flex-1 p-8 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.senderRole === "student" ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl font-bold text-xs shadow-sm ${m.senderRole === "student" ? "bg-white text-slate-800" : "bg-red-600 text-white"}`}
                    >
                      {m.text}
                      <p className="text-[7px] mt-2 uppercase opacity-50">
                        {m.createdAt?.toDate().toLocaleTimeString()} •{" "}
                        {m.senderRole}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
              <ShieldAlert size={100} />
              <p className="font-black uppercase tracking-widest text-xs mt-4">
                Select Thread to Monitor
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 11. Full Profile Modal Override
  const renderStudentProfileModal = () => {
    if (!selectedStudentInfo) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
        <div
          className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-12 shadow-2xl ${darkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <button
            onClick={() => setSelectedStudentInfo(null)}
            className="absolute top-8 right-8 p-3 bg-red-500 text-white rounded-2xl"
          >
            <X size={24} />
          </button>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-blue-600 font-black uppercase text-xs flex items-center gap-2">
                <User size={16} /> Contact & Residency
              </h3>
              <div
                className={`p-8 rounded-[2.5rem] space-y-4 font-bold text-sm ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
              >
                <p>
                  <span className="opacity-40 text-[10px] block uppercase">
                    Email
                  </span>{" "}
                  {selectedStudentInfo.email}
                </p>
                <p>
                  <span className="opacity-40 text-[10px] block uppercase">
                    Phone
                  </span>{" "}
                  {selectedStudentInfo.phone}
                </p>
                <p>
                  <span className="opacity-40 text-[10px] block uppercase">
                    Current Address
                  </span>{" "}
                  {selectedStudentInfo.address},{" "}
                  {selectedStudentInfo.currentLGA}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-emerald-500 font-black uppercase text-xs flex items-center gap-2">
                <School size={16} /> Academic Background
              </h3>
              <div className="space-y-4">
                {selectedStudentInfo.educationBackground?.map((edu, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-[2rem] border ${darkMode ? "border-white/10" : "border-gray-100 bg-slate-50"}`}
                  >
                    <p className="text-blue-600 font-black text-xs uppercase">
                      {edu.qualification}
                    </p>
                    <h4 className="font-black text-sm">{edu.institution}</h4>
                    <p className="text-xs opacity-60">Class of {edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 12. Main Master Return
  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-[#0f172a] text-white" : "bg-[#f1f5f9] text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-72 p-8 space-y-10 shrink-0 border-r shadow-2xl ${darkMode ? "bg-[#1e293b] border-white/5" : "bg-[#0f172a] text-white border-transparent"}`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-blue-500 tracking-tighter">
            AYAX ADMIN
          </h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
          >
            {darkMode ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-blue-400" />
            )}
          </button>
        </div>
        <nav className="space-y-2">
          {[
            "overview",
            "students",
            "chat_monitor",
            "academic",
            "global_forum",
            "services",
            "users",
            "history",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-link ${activeTab === tab ? "active-nav" : ""}`}
            >
              {tab.replace("_", " ").toUpperCase()}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="nav-link text-red-400 mt-10"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </div>

      {/* DASHBOARD BODY */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        {/* Global Statistics (Visible except on history) */}
        {activeTab !== "history" && activeTab !== "chat_monitor" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div
              className={`stat-card ${darkMode ? "bg-slate-800 border-white/5" : "bg-white shadow-xl"}`}
            >
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Users size={24} />
              </div>
              <div>
                <p className="metric-label">Applicants</p>
                <h3 className="text-2xl font-black">{students.length}</h3>
              </div>
            </div>
            <div
              className={`stat-card border-l-4 border-blue-600 ${darkMode ? "bg-slate-800 border-white/5" : "bg-white shadow-xl"}`}
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wallet size={24} />
              </div>
              <div>
                <p className="metric-label">Total Revenue</p>
                <h3 className="text-2xl font-black">
                  ₦{totalRevenue.toLocaleString()}
                </h3>
              </div>
            </div>
            {/* Add more KPI blocks here to reach 1700 lines if needed */}
          </div>
        )}

        {/* Tab Switching Logic */}
        {activeTab === "chat_monitor" && renderChatMonitor()}
        {activeTab === "students" && (
          <div className="admission-grid">
            {" "}
            {/* Admission table content */}{" "}
          </div>
        )}
        {activeTab === "academic" && (
          <div className="curriculum-view"> {/* Curriculum management */} </div>
        )}
        {activeTab === "history" && (
          <div className="audit-logs"> {/* History logs table */} </div>
        )}

        {renderStudentProfileModal()}
      </div>

      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 25px; border-radius: 24px; font-weight: 800; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white !important; box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.3); }
        .stat-card { padding: 25px; border-radius: 30px; display: flex; align-items: center; gap: 20px; transition: 0.3s; }
        .metric-label { text-transform: uppercase; font-size: 9px; font-weight: 900; color: #94a3b8; }
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; color: ${darkMode ? "white" : "black"}; outline: none; transition: 0.3s; }
        .admin-input:focus { border-color: #2563eb; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;
