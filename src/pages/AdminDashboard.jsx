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

  // 1. REAL-TIME DATA ENGINE
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "course_applications"),
      (snap) => {
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

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

    return () => {
      unsubStudents();
      unsubGallery();
      unsubChats();
      unsubPortal();
      unsubLogs();
      unsubNews();
    };
  }, []);

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || s.paymentStatus === filterStatus;
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
      `Portal state: ${newStatus ? "ACTIVE" : "LOCKDOWN"}`,
    );
  };

  const handleGalleryUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "gallery"), {
        title: galleryTitle,
        url: galleryUrl,
        category: galleryCategory,
        createdAt: serverTimestamp(),
      });
      setGalleryTitle("");
      setGalleryUrl("");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (id, title) => {
    if (window.confirm(`Delete ${title}?`)) {
      await deleteDoc(doc(db, "gallery", id));
      logActivity("GALLERY_DELETE", `Deleted image: ${title}`);
    }
  };

  const handlePublishNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "news_feed"), {
        ...newsData,
        createdAt: serverTimestamp(),
      });
      setNewsData({ title: "", content: "", category: "General", image: "" });
    } catch (err) {
      alert("Error publishing news.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id, title) => {
    if (window.confirm(`Delete news: ${title}?`)) {
      await deleteDoc(doc(db, "news_feed", id));
    }
  };

  const handleAutomaticIDDispatch = async (student) => {
    setLoading(true);
    const generatedID = `AYX-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await updateDoc(doc(db, "course_applications", student.id), {
      studentId: generatedID,
      status: "Admitted",
    });
    alert(`ID Dispatched: ${generatedID}`);
    setLoading(false);
  };

  const formPaidCount = students.filter(
    (s) => s.paymentStatus === "Verified" || s.paymentStatus === "Form_Paid",
  ).length;
  const totalRevenue = formPaidCount * 100; // Updated to 100 NGN

  return (
    <div
      className={`min-h-screen flex font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-80 border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xl"}`}
      >
        <div className="p-10 text-center">
          <h2 className="text-3xl font-black italic tracking-tighter text-blue-600">
            AYAX GLOBAL
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">
            Control Infrastructure
          </p>
        </div>
        <nav className="flex-1 px-6 space-y-3">
          {[
            "overview",
            "admissions",
            "manual_gen",
            "surveillance",
            "history",
            "gallery_manager",
            "news_manager",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] font-black text-xs uppercase transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-xl scale-105" : "hover:bg-blue-500/10 opacity-60"}`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </nav>
        <div className="p-8 mt-auto">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full py-4 bg-slate-500/10 rounded-2xl font-black text-[10px] uppercase mb-4"
          >
            Toggle {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={() => signOut(auth)}
            className="w-full py-5 bg-red-600/10 text-red-600 rounded-2xl font-black text-[10px] uppercase"
          >
            Shutdown
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-28 border-b flex items-center justify-between px-12 bg-white/5 backdrop-blur-3xl shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase opacity-40 text-emerald-500">
              Revenue
            </span>
            <div className="text-xl font-black text-emerald-500">
              ₦{totalRevenue.toLocaleString()}
            </div>
          </div>
          <button
            onClick={togglePortal}
            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {portalStatus ? "Lockdown" : "Open System"}
          </button>
        </header>

        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <Activity size={32} />
                <h4 className="metric-label">Applications</h4>
                <p className="text-5xl font-black">{students.length}</p>
              </div>
            </div>
          )}

          {activeTab === "admissions" && (
            <div className="space-y-8">
              <div className="flex gap-4">
                <input
                  placeholder="Search Students..."
                  className="admin-input flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase">
                    <tr>
                      <th className="p-8">Student</th>
                      <th className="p-8">Course</th>
                      <th className="p-8">Status</th>
                      <th className="p-8">View Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((s) => (
                      <tr key={s.id}>
                        <td className="p-8 flex items-center gap-4">
                          <img
                            src={s.passportUrl}
                            className="w-12 h-12 rounded-xl"
                          />
                          {s.studentName}
                        </td>
                        <td className="p-8 text-xs">{s.course}</td>
                        <td className="p-8">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
                            {s.paymentStatus || "Verified"}
                          </span>
                        </td>
                        <td className="p-8">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-4 bg-blue-600 text-white rounded-2xl"
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

          {/* STUDENT FORM MODAL (New Feature Integrated) */}
          {selectedStudent && (
            <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
              <div
                className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 relative ${darkMode ? "bg-slate-900" : "bg-white"}`}
              >
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-8 right-8 p-4 bg-red-500/10 text-red-600 rounded-full"
                >
                  <X size={24} />
                </button>
                <div className="flex gap-8 mb-10 border-b pb-10">
                  <img
                    src={selectedStudent.passportUrl}
                    className="w-40 h-40 rounded-[2.5rem] object-cover"
                  />
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase">
                      {selectedStudent.studentName}
                    </h2>
                    <p className="text-blue-600 font-bold uppercase text-xs">
                      {selectedStudent.course}
                    </p>
                    <div className="flex gap-2 pt-4">
                      <span className="p-2 bg-slate-100 rounded-xl text-[10px] font-black">
                        {selectedStudent.email}
                      </span>
                      <span className="p-2 bg-slate-100 rounded-xl text-[10px] font-black">
                        {selectedStudent.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">
                      Resident Details
                    </h4>
                    <p className="text-sm font-bold">
                      {selectedStudent.address}
                    </p>
                    <p className="text-sm">
                      {selectedStudent.currentLGA},{" "}
                      {selectedStudent.currentState}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">
                      Academic Data
                    </h4>
                    {selectedStudent.education?.map((edu, i) => (
                      <p key={i} className="text-xs font-bold border-b py-2">
                        {edu.qualification} - {edu.institution}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-10 p-6 bg-blue-50 rounded-3xl flex justify-between items-center">
                  <p className="font-mono text-sm font-black text-blue-600">
                    {selectedStudent.transactionRef}
                  </p>
                  <button
                    onClick={() => handleAutomaticIDDispatch(selectedStudent)}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px]"
                  >
                    Dispatch ID
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery_manager" && (
            <div className="space-y-8">
              <form
                onSubmit={handleGalleryUpload}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <input
                  placeholder="Image Title"
                  className="admin-input"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  required
                />
                <input
                  placeholder="Image URL"
                  className="admin-input"
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-2xl font-black uppercase text-xs"
                >
                  Upload to Gallery
                </button>
              </form>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {galleryItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.url}
                      className="rounded-3xl h-40 w-full object-cover"
                    />
                    <button
                      onClick={() =>
                        handleDeleteGalleryItem(item.id, item.title)
                      }
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "news_manager" && (
            <div className="space-y-8">
              <form
                onSubmit={handlePublishNews}
                className="space-y-4 bg-white p-10 rounded-[3rem] border"
              >
                <input
                  placeholder="News Title"
                  className="admin-input"
                  value={newsData.title}
                  onChange={(e) =>
                    setNewsData({ ...newsData, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="News Content"
                  className="admin-input h-32"
                  value={newsData.content}
                  onChange={(e) =>
                    setNewsData({ ...newsData, content: e.target.value })
                  }
                />
                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase">
                  Publish Official News
                </button>
              </form>
              <div className="space-y-4">
                {newsFeed.map((news) => (
                  <div
                    key={news.id}
                    className="flex justify-between items-center bg-white p-6 rounded-2xl border"
                  >
                    <h5 className="font-black text-sm uppercase">
                      {news.title}
                    </h5>
                    <button
                      onClick={() => handleDeleteNews(news.id, news.title)}
                      className="text-red-600"
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 bg-white rounded-2xl border flex justify-between"
                >
                  <p className="text-xs font-bold uppercase">
                    {log.action}: {log.details}
                  </p>
                  <span className="text-[10px] opacity-40">
                    {new Date(log.timestamp?.seconds * 1000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 800; font-size: 0.8rem; outline: none; transition: 0.3s; color: inherit; }
        .admin-input:focus { border-color: #2563eb; }
        .stat-card { padding: 40px; border-radius: 40px; background: ${darkMode ? "#0f172a" : "white"}; border: 1px solid rgba(0,0,0,0.05); }
        .metric-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
