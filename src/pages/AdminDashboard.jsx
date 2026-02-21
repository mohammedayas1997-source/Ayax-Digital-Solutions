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
  Camera, // GYARA: Na kara Camera a nan domin Gallery ya yi aiki
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
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

  // 1. REAL-TIME DATA ENGINE (CORE STREAMS)
  useEffect(() => {
    // A nan na hade dukkan listeners din wuri daya don kaucewa blank screen
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
      alert("GALLERY UPDATED!");
      setGalleryTitle("");
      setGalleryUrl("");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (id, title) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}" from the gallery?`,
      )
    ) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "gallery", id));
        await logActivity("GALLERY_DELETE", `Deleted image: ${title}`);
        alert("Image deleted successfully.");
      } catch (err) {
        alert("Error deleting image.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, "private_chats"),
      where("studentId", "==", selectedChat.studentId),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedChat]);

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
      `Portal system state: ${newStatus ? "ACTIVE" : "LOCKDOWN"}`,
    );
  };

  const handlePublishNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "news_feed"), {
        ...newsData,
        createdAt: serverTimestamp(),
        adminEmail: auth.currentUser?.email,
      });
      alert("NEWS PUBLISHED: Labari ya tafi Home Page nasara.");
      setNewsData({ title: "", content: "", category: "General", image: "" });
      logActivity("NEWS_PUBLISH", `Published news: ${newsData.title}`);
    } catch (err) {
      alert("Error publishing news.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId, title) => {
    if (window.confirm(`Are you sure you want to delete: "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "news_feed", newsId));
        logActivity("NEWS_DELETE", `Deleted news article: ${title}`);
        alert("News article removed successfully.");
      } catch (err) {
        alert("Failed to delete news.");
      }
    }
  };

  const handleAutomaticIDDispatch = async (student) => {
    if (student.paymentStatus !== "Form_Paid") {
      alert("ERROR: No payment proof found for this student.");
      return;
    }
    setLoading(true);
    const generatedID = `AYX-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const courseLink = `https://ayaxacademy.com/portal`;
    const emailSubject = encodeURIComponent(
      "Admission Approved - Student ID Assigned",
    );
    const messageBody = `Hello ${student.studentName},%0D%0A%0D%0AYour Form payment is verified.%0D%0AYour Student ID: ${generatedID}%0D%0APortal Link: ${courseLink}%0D%0A%0D%0ARegards, Ayax Academy.`;

    try {
      await updateDoc(doc(db, "course_applications", student.id), {
        studentId: generatedID,
        status: "Admitted",
        idAssignedAt: serverTimestamp(),
      });
      window.open(
        `mailto:${student.email}?subject=${emailSubject}&body=${messageBody}`,
        "_blank",
      );
      const waMsg = encodeURIComponent(
        `Hello ${student.studentName}, Admission Confirmed! ID: ${generatedID}. Portal: ${courseLink}`,
      );
      window.open(`https://wa.me/${student.phone}?text=${waMsg}`, "_blank");
      await logActivity(
        "AUTO_ID_DISPATCH",
        `Generated & Dispatched ID ${generatedID} to ${student.studentName}`,
      );
      alert(`SUCCESS: ID ${generatedID} sent to Email and WhatsApp.`);
    } catch (err) {
      alert("CRITICAL ERROR: ID dispatch failed.");
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async (student) => {
    const certSerial = `AYX-CERT-${Date.now()}`;
    try {
      await updateDoc(doc(db, "course_applications", student.id), {
        certStatus: "Issued",
        certSerial: certSerial,
        certDate: serverTimestamp(),
      });
      const msg = encodeURIComponent(
        `Congratulations ${student.studentName}! Your certificate ${certSerial} is ready in your portal.`,
      );
      window.open(`https://wa.me/${student.phone}?text=${msg}`, "_blank");
      await logActivity(
        "CERT_ISSUE",
        `Certificate ${certSerial} issued to ${student.studentName}`,
      );
      alert("Certificate Protocol Executed.");
    } catch (err) {
      alert("Certificate Error.");
    }
  };

  const directMessage = (target, mode) => {
    const contact = target === "supervisor" ? SUPERVISOR_INFO : target;
    const text = encodeURIComponent(
      "URGENT: Administrative update from Ayax Academy Global Controller.",
    );
    if (mode === "email") {
      window.open(
        `mailto:${contact.email}?subject=System Alert&body=${text}`,
        "_blank",
      );
    } else {
      window.open(`https://wa.me/${contact.phone}?text=${text}`, "_blank");
    }
  };

  const handleManualCertGen = async (e) => {
    e.preventDefault();
    setLoading(true);
    const manualID = `AYX-MAN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const certSerial = `AYX-GIFT-${Date.now()}`;
    const verificationURL = `https://ayaxacademy.com/verify/${certSerial}`;
    const qrCodeAPI = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationURL)}`;

    try {
      await addDoc(collection(db, "manual_certificates"), {
        ...manualCert,
        studentId: manualID,
        certSerial: certSerial,
        qrCode: qrCodeAPI,
        issuedBy: auth.currentUser?.email,
        timestamp: serverTimestamp(),
      });

      const waMsg = encodeURIComponent(
        `Hello ${manualCert.name}, an Honorary Certificate has been generated for you.\n\nSerial: ${certSerial}\nIssue Date: ${manualCert.issueDate}\nVerify: ${verificationURL}`,
      );
      window.open(`https://wa.me/${manualCert.phone}?text=${waMsg}`, "_blank");
      await logActivity(
        "MANUAL_CERT_GEN",
        `Manual Certificate ${certSerial} generated for ${manualCert.name}`,
      );
      alert(`SUCCESS: Manual ID ${manualID} Generated.`);
      setManualCert({
        name: "",
        course: "",
        email: "",
        phone: "",
        grade: "Distinction",
        issueDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      alert("ERROR: Manual Gen Failed.");
    } finally {
      setLoading(false);
    }
  };

  const formPaidCount = students.filter(
    (s) => s.paymentStatus === "Form_Paid",
  ).length;
  const totalRevenue = formPaidCount * 5000;

  return (
    <div
      className={`min-h-screen flex font-sans ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

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
          <h2 className="text-3xl font-black italic tracking-tighter text-blue-600">
            AYAX GLOBAL
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">
            Control Infrastructure
          </p>
        </div>

        <nav className="flex-1 px-6 space-y-3">
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

        <div className="p-8 space-y-4">
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
            className="w-full py-5 bg-red-600/10 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={20} className="inline mr-2" /> Shutdown
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-28 border-b flex items-center justify-between px-6 lg:px-12 bg-white/5 backdrop-blur-3xl shrink-0">
          <div className="flex items-center gap-4 lg:gap-12">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 bg-blue-600 text-white rounded-xl lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40 text-emerald-500">
                Gross Revenue
              </span>
              <div className="text-xl lg:text-3xl font-black tracking-tighter text-emerald-500">
                ₦{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40 text-blue-500">
                Talent Pool
              </span>
              <div className="text-xl lg:text-3xl font-black tracking-tighter text-blue-500">
                {students.length}
              </div>
            </div>
          </div>
          <button
            onClick={togglePortal}
            className={`px-6 lg:px-10 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-2xl ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {portalStatus ? "Lockdown" : "Open System"}
          </button>
        </header>

        <div className="flex-1 p-4 lg:p-12 overflow-y-auto custom-scrollbar">
          {activeTab === "news_manager" && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
              <div
                className={`p-8 lg:p-12 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
              >
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600 mb-8 flex items-center gap-4">
                  <Newspaper size={28} /> Publish New Update
                </h3>
                <form onSubmit={handlePublishNews} className="space-y-6">
                  <input
                    required
                    className="admin-input"
                    placeholder="News Title"
                    value={newsData.title}
                    onChange={(e) =>
                      setNewsData({ ...newsData, title: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <select
                      className="admin-input"
                      value={newsData.category}
                      onChange={(e) =>
                        setNewsData({ ...newsData, category: e.target.value })
                      }
                    >
                      <option value="General">General</option>
                      <option value="Admission">Admission</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <input
                      className="admin-input"
                      placeholder="Image URL"
                      value={newsData.image}
                      onChange={(e) =>
                        setNewsData({ ...newsData, image: e.target.value })
                      }
                    />
                  </div>
                  <textarea
                    required
                    className="admin-input min-h-[150px] pt-5"
                    placeholder="Content Body"
                    value={newsData.content}
                    onChange={(e) =>
                      setNewsData({ ...newsData, content: e.target.value })
                    }
                  ></textarea>
                  <button
                    disabled={loading}
                    className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl hover:bg-slate-900 transition-all"
                  >
                    {loading ? (
                      <RefreshCcw className="animate-spin mx-auto" />
                    ) : (
                      "Broadcast to News Feed"
                    )}
                  </button>
                </form>
              </div>

              <div
                className={`rounded-[3rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
              >
                <div className="p-8 border-b border-slate-800/10">
                  <h3 className="text-xl font-black uppercase italic text-slate-500 tracking-widest">
                    Active News Stream
                  </h3>
                </div>
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-500/5 text-[10px] font-black uppercase opacity-60">
                    <tr>
                      <th className="p-8">Headline</th>
                      <th className="p-8">Category</th>
                      <th className="p-8">Date Published</th>
                      <th className="p-8 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10 font-bold">
                    {newsFeed.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-500/5 transition-all"
                      >
                        <td className="p-8">
                          <p className="text-sm font-black uppercase truncate max-w-xs">
                            {item.title}
                          </p>
                        </td>
                        <td className="p-8">
                          <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded-lg text-[9px] uppercase border border-blue-600/20">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-8 text-xs opacity-50">
                          {item.createdAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="p-8 text-center">
                          <button
                            onClick={() =>
                              handleDeleteNews(item.id, item.title)
                            }
                            className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "gallery_manager" && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
              <div
                className={`p-8 lg:p-12 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
              >
                <h3 className="text-2xl font-black italic uppercase text-blue-600 mb-8 flex items-center gap-4">
                  <PlusCircle size={28} /> Add New Gallery Image
                </h3>
                <form
                  onSubmit={handleGalleryUpload}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <input
                    required
                    className="admin-input"
                    placeholder="Image Title"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                  />
                  <input
                    required
                    className="admin-input"
                    placeholder="Category"
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                  />
                  <input
                    required
                    className="admin-input md:col-span-2"
                    placeholder="Image URL"
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                  />
                  <button
                    disabled={loading}
                    className="md:col-span-2 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs"
                  >
                    {loading ? "Uploading..." : "Publish to Gallery"}
                  </button>
                </form>
              </div>
              <div
                className={`rounded-[3rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
              >
                <div className="p-8 border-b border-slate-800/10">
                  <h3 className="text-xl font-black uppercase italic text-slate-500 tracking-widest">
                    Manage Archives
                  </h3>
                </div>
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-500/5 text-[10px] font-black uppercase opacity-60">
                    <tr>
                      <th className="p-8">Visual</th>
                      <th className="p-8">Identity</th>
                      <th className="p-8">Category</th>
                      <th className="p-8 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10">
                    {galleryItems.map((img) => (
                      <tr
                        key={img.id}
                        className="hover:bg-slate-500/5 transition-all font-bold"
                      >
                        <td className="p-8">
                          <img
                            src={img.url}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-blue-600/20"
                            alt=""
                          />
                        </td>
                        <td className="p-8 text-sm uppercase tracking-tighter">
                          {img.title}
                        </td>
                        <td className="p-8 text-xs opacity-50 uppercase">
                          {img.category}
                        </td>
                        <td className="p-8 text-center">
                          <button
                            onClick={() =>
                              handleDeleteGalleryItem(img.id, img.title)
                            }
                            className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "admissions" && (
            <div
              className={`rounded-[3rem] border overflow-x-auto ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
            >
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-500/5 text-[11px] font-black uppercase opacity-60">
                  <tr>
                    <th className="p-8">Identity</th>
                    <th className="p-8">Clearance</th>
                    <th className="p-8">Credentialing</th>
                    <th className="p-8 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/10 font-bold">
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-500/5 transition-all"
                    >
                      <td className="p-8 flex items-center gap-5">
                        <img
                          src={s.passportUrl}
                          className="w-14 h-14 rounded-[1.2rem] object-cover border-2 border-blue-600/30"
                        />
                        <div>
                          <p className="text-sm font-black uppercase">
                            {s.studentName}
                          </p>
                          <p className="text-[10px] text-blue-500 uppercase">
                            {s.course}
                          </p>
                        </div>
                      </td>
                      <td className="p-8">
                        <span
                          className={`px-4 py-2 rounded-xl text-[10px] uppercase border ${s.paymentStatus === "Form_Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-red-500/10 text-red-500 border-red-500/30"}`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="p-8">
                        {s.studentId ? (
                          <div className="flex items-center gap-3">
                            <Zap size={16} className="text-purple-500" />
                            <span className="font-mono text-xs">
                              {s.studentId}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAutomaticIDDispatch(s)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase"
                          >
                            Dispatch ID
                          </button>
                        )}
                      </td>
                      <td className="p-8 flex justify-center gap-3">
                        <button
                          onClick={() => issueCertificate(s)}
                          className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl"
                        >
                          <Award size={20} />
                        </button>
                        <button
                          onClick={() => directMessage(s, "email")}
                          className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl"
                        >
                          <Mail size={20} />
                        </button>
                        <button
                          onClick={() => directMessage(s, "whatsapp")}
                          className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl"
                        >
                          <MessageSquare size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="stat-card">
                <Activity className="text-blue-600 mb-6" size={32} />
                <h4 className="metric-label">System Admissions</h4>
                <p className="text-6xl font-black">{students.length}</p>
              </div>
              <div className="stat-card">
                <CheckCircle className="text-emerald-500 mb-6" size={32} />
                <h4 className="metric-label">Revenue Sources</h4>
                <p className="text-6xl font-black">{formPaidCount}</p>
              </div>
              <div className="stat-card">
                <Fingerprint className="text-purple-500 mb-6" size={32} />
                <h4 className="metric-label">Security IDs Active</h4>
                <p className="text-6xl font-black">
                  {students.filter((s) => s.studentId).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 800; font-size: 0.8rem; outline: none; transition: 0.3s; color: inherit; }
        .admin-input:focus { border-color: #2563eb; }
        .metric-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.15em; }
        .stat-card { padding: 50px; border-radius: 50px; background: ${darkMode ? "#0f172a" : "white"}; border: 1px solid rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
