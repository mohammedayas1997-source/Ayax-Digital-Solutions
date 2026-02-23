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
  LayoutDashboard,
  Users,
  MessageSquare,
  ShieldCheck,
  History,
  LogOut,
  Moon,
  Sun,
  Lock,
  Unlock,
  Eye,
  CheckCircle,
  Search,
  Bell,
  Activity,
  X,
  Fingerprint,
  Mail,
  Send,
  ExternalLink,
  Wallet,
  TrendingUp,
  Award,
  UserCheck,
  ShieldAlert,
  FileText,
  Zap,
  QrCode,
  PlusCircle,
  RefreshCcw,
  Menu,
  Calendar,
  Newspaper,
  Trash2,
  Camera,
  MapPin,
  Phone,
  CreditCard,
  Filter,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [chats, setChats] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [portalStatus, setPortalStatus] = useState(true);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Workshop");
  const [galleryItems, setGalleryItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [autoReplyText, setAutoReplyText] = useState("");

  const [newsData, setNewsData] = useState({
    title: "",
    content: "",
    category: "General",
    image: "",
  });

  const [manualCert, setManualCert] = useState({
    name: "",
    course: "",
    email: "",
    phone: "",
    grade: "Distinction",
    issueDate: new Date().toISOString().split("T")[0],
  });

  const SUPERVISOR_INFO = {
    email: "supervisor@ayaxacademy.com",
    phone: "2348000000000",
  };

  // 1. REAL-TIME DATA ENGINE (Multiple Streams)
  useEffect(() => {
    const qApplications = query(
      collection(db, "course_applications"),
      orderBy("appliedAt", "desc"),
    );
    const unsubStudents = onSnapshot(qApplications, (snap) => {
      setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubGallery = onSnapshot(
      query(collection(db, "gallery"), orderBy("createdAt", "desc")),
      (snap) => {
        setGalleryItems(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
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

    const unsubPortal = onSnapshot(
      doc(db, "system_settings", "portal_control"),
      (docSnap) => {
        if (docSnap.exists()) setPortalStatus(docSnap.data().isOpen);
      },
    );

    const unsubLogs = onSnapshot(
      query(collection(db, "admin_logs"), orderBy("timestamp", "desc")),
      (snap) => {
        setHistoryLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubNews = onSnapshot(
      query(collection(db, "news_feed"), orderBy("createdAt", "desc")),
      (snap) => {
        setNewsFeed(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    getDoc(doc(db, "system_settings", "chat_config")).then((docSnap) => {
      if (docSnap.exists()) setAutoReplyText(docSnap.data().autoReplyMessage);
    });

    return () => {
      unsubStudents();
      unsubGallery();
      unsubChats();
      unsubPortal();
      unsubLogs();
      unsubNews();
    };
  }, []);

  // SEARCH & FILTER LOGIC (Improved for Undefined Statuses)
  const filteredStudents = students.filter((s) => {
    const name = s.studentName || "";
    const email = s.email || "";
    const course = s.course || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = s.paymentStatus || "Verified";
    const matchesFilter =
      filterStatus === "All" ||
      currentStatus === filterStatus ||
      (filterStatus === "Form_Paid" && currentStatus === "Verified");

    return matchesSearch && matchesFilter;
  });

  const logActivity = async (action, details) => {
    await addDoc(collection(db, "admin_logs"), {
      action,
      details,
      timestamp: serverTimestamp(),
      adminEmail: auth.currentUser?.email,
    });
  };

  const togglePortal = async () => {
    const newStatus = !portalStatus;
    await setDoc(
      doc(db, "system_settings", "portal_control"),
      { isOpen: newStatus },
      { merge: true },
    );
    logActivity(
      "PORTAL_TOGGLE",
      `Portal state changed to: ${newStatus ? "ACTIVE" : "LOCKDOWN"}`,
    );
  };

  const handleAutomaticIDDispatch = async (student) => {
    setLoading(true);
    const generatedID = `AYX-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    try {
      await updateDoc(doc(db, "course_applications", student.id), {
        studentId: generatedID,
        status: "Admitted",
        idAssignedAt: serverTimestamp(),
      });
      await logActivity(
        "AUTO_ID_DISPATCH",
        `ID ${generatedID} issued to ${student.studentName}`,
      );
      alert(`SUCCESS: ID ${generatedID} assigned.`);
    } catch (err) {
      alert("Dispatch failed.");
    } finally {
      setLoading(false);
    }
  };

  const formPaidCount = students.filter(
    (s) => s.paymentStatus === "Form_Paid" || s.paymentStatus === "Verified",
  ).length;
  const totalRevenue = formPaidCount * 100;

  return (
    <div
      className={`min-h-screen flex font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-80 border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xl"}`}
      >
        <div className="p-10 text-center relative">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 lg:hidden"
          >
            <X size={20} />
          </button>
          <h2 className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">
            AYAX GLOBAL
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">
            Control Infrastructure
          </p>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          {[
            {
              id: "overview",
              icon: <LayoutDashboard size={20} />,
              label: "Command Center",
            },
            {
              id: "admissions",
              icon: <Users size={20} />,
              label: "Admission Flow",
            },
            {
              id: "manual_gen",
              icon: <PlusCircle size={20} />,
              label: "Manual Minting",
            },
            {
              id: "surveillance",
              icon: <Eye size={20} />,
              label: "Chat Intelligence",
            },
            {
              id: "history",
              icon: <History size={20} />,
              label: "System Logs",
            },
            {
              id: "gallery_manager",
              icon: <Camera size={20} />,
              label: "Media Gallery",
            },
            {
              id: "news_manager",
              icon: <Newspaper size={20} />,
              label: "News Manager",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] font-black text-xs uppercase transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-xl scale-105" : "hover:bg-blue-500/10 opacity-60"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full py-4 flex items-center justify-center gap-4 bg-slate-500/10 rounded-2xl font-black text-[10px] uppercase"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-blue-500" />
            )}{" "}
            {darkMode ? "Light" : "Dark"} Mode
          </button>
          <button
            onClick={() => signOut(auth)}
            className="w-full py-5 bg-red-600/10 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-600/20"
          >
            <LogOut size={20} className="inline mr-2" /> Shutdown
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-28 border-b flex items-center justify-between px-6 lg:px-12 bg-white/5 backdrop-blur-3xl shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 bg-blue-600 text-white rounded-xl lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40 text-emerald-500">
                Revenue (₦100 Mode)
              </span>
              <div className="text-xl font-black text-emerald-500">
                ₦{totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={togglePortal}
            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {portalStatus ? "Lockdown" : "Open System"}
          </button>
        </header>

        <div className="flex-1 p-4 lg:p-12 overflow-y-auto custom-scrollbar">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <Activity className="text-blue-600 mb-4" size={32} />
                <h4 className="metric-label">Applications</h4>
                <p className="text-5xl font-black">{students.length}</p>
              </div>
              <div className="stat-card">
                <CheckCircle className="text-emerald-500 mb-4" size={32} />
                <h4 className="metric-label">Paid Forms</h4>
                <p className="text-5xl font-black">{formPaidCount}</p>
              </div>
              <div className="stat-card">
                <Zap className="text-purple-500 mb-4" size={32} />
                <h4 className="metric-label">Smart IDs</h4>
                <p className="text-5xl font-black">
                  {students.filter((s) => s.studentId).length}
                </p>
              </div>
            </div>
          )}

          {activeTab === "admissions" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Name, Email or Course..."
                    className="admin-input pl-16"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 bg-blue-600/5 p-2 rounded-2xl border border-blue-600/10">
                  <Filter size={18} className="ml-4 opacity-40" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent font-black text-[10px] uppercase p-3 outline-none"
                  >
                    <option value="All">All Applications</option>
                    <option value="Verified">Verified (₦100)</option>
                    <option value="Form_Paid">Paid (Old ₦5k)</option>
                  </select>
                </div>
              </div>

              <div
                className={`rounded-[3rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
              >
                <table className="w-full text-left">
                  <thead className="bg-slate-500/5 text-[10px] font-black uppercase opacity-60">
                    <tr>
                      <th className="p-8">Student Detail</th>
                      <th className="p-8">Contact</th>
                      <th className="p-8">Status</th>
                      <th className="p-8 text-center">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10 font-bold">
                    {filteredStudents.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-blue-500/5 transition-colors group"
                      >
                        <td className="p-8 flex items-center gap-4">
                          <img
                            src={s.passportUrl}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-600/20"
                          />
                          <div>
                            <p className="text-sm uppercase">{s.studentName}</p>
                            <p className="text-[9px] text-blue-600">
                              {s.course}
                            </p>
                          </div>
                        </td>
                        <td className="p-8 text-[10px]">
                          <p className="flex items-center gap-2">
                            <Mail size={12} /> {s.email}
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <Phone size={12} /> {s.phone}
                          </p>
                        </td>
                        <td className="p-8">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] uppercase tracking-widest">
                            {s.paymentStatus || "Verified"}
                          </span>
                        </td>
                        <td className="p-8 text-center">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all"
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* THE STUDENT FORM MODAL (Full View Integration) */}
          {selectedStudent && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/50">
              <div
                className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 relative shadow-2xl ${darkMode ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-900"}`}
              >
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-8 right-8 p-4 bg-red-600 text-white rounded-full hover:scale-110 transition-all"
                >
                  <X size={24} />
                </button>
                <div className="flex flex-col md:flex-row gap-10 mb-10 border-b pb-10 border-slate-500/10">
                  <img
                    src={selectedStudent.passportUrl}
                    className="w-48 h-48 object-cover rounded-[2.5rem] border-4 border-blue-600/20 shadow-xl"
                  />
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black uppercase text-blue-600">
                      {selectedStudent.studentName}
                    </h2>
                    <p className="text-xs font-black uppercase opacity-50 tracking-[0.2em]">
                      {selectedStudent.course}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <span className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black flex items-center gap-2 uppercase">
                        <Mail size={12} /> {selectedStudent.email}
                      </span>
                      <span className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black flex items-center gap-2 uppercase">
                        <Phone size={12} /> {selectedStudent.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="info-box space-y-4">
                    <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> Geographic Origin
                    </h4>
                    <p className="text-sm font-black">
                      Address: {selectedStudent.address}
                    </p>
                    <p className="text-sm font-black">
                      State: {selectedStudent.stateOfOrigin} (
                      {selectedStudent.lgaOfOrigin})
                    </p>
                    <p className="text-sm font-black text-blue-500">
                      Residence: {selectedStudent.currentState},{" "}
                      {selectedStudent.currentLGA}
                    </p>
                  </div>
                  <div className="info-box space-y-4">
                    <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest flex items-center gap-2">
                      <Award size={12} /> Academic Credentials
                    </h4>
                    {selectedStudent.education?.map((edu, idx) => (
                      <div
                        key={idx}
                        className="border-b border-slate-500/10 pb-2 last:border-0"
                      >
                        <p className="text-[10px] font-black text-blue-600 uppercase">
                          {edu.qualification}
                        </p>
                        <p className="text-xs font-bold uppercase">
                          {edu.institution} ({edu.year})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-10 p-8 bg-blue-600/5 rounded-3xl border-2 border-dashed border-blue-600/20 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Financial Reference
                    </p>
                    <p className="font-mono text-lg font-black text-blue-600">
                      {selectedStudent.transactionRef || "PROCESSED"}
                    </p>
                  </div>
                  {!selectedStudent.studentId && (
                    <button
                      onClick={() => handleAutomaticIDDispatch(selectedStudent)}
                      className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl hover:bg-slate-900 transition-all"
                    >
                      <Zap size={16} /> Dispatch Official ID
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 bg-white/5 border border-slate-500/10 rounded-2xl flex justify-between items-center"
                >
                  <p className="text-xs font-black uppercase">
                    {log.action}: {log.details}
                  </p>
                  <span className="text-[10px] font-bold opacity-40 tracking-tighter">
                    {new Date(log.timestamp?.seconds * 1000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* [Other original tabs (manual_gen, gallery_manager, etc.) go here...] */}
        </div>
      </main>

      <style>{`
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 800; font-size: 0.8rem; outline: none; transition: 0.3s; color: inherit; }
        .admin-input:focus { border-color: #2563eb; }
        .metric-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.15em; }
        .stat-card { padding: 40px; border-radius: 40px; background: ${darkMode ? "#0f172a" : "white"}; border: 1px solid rgba(0,0,0,0.05); }
        .info-box { padding: 25px; background: ${darkMode ? "#1e293b" : "#f8fafc"}; border-radius: 1.5rem; border: 1px solid ${darkMode ? "#334155" : "#e2e8f0"}; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
