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
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [portalStatus, setPortalStatus] = useState(true);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // SUPERVISOR PROTOCOL DATA
  const SUPERVISOR_INFO = {
    email: "supervisor@ayaxacademy.com",
    phone: "2348000000000", // Replace with actual
  };

  // 1. REAL-TIME DATA ENGINE (CORE STREAMS)
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "course_applications"),
      (snap) => {
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

    return () => {
      unsubStudents();
      unsubChats();
      unsubPortal();
      unsubLogs();
    };
  }, []);

  // 2. CHAT SURVEILLANCE ENGINE
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

  // 3. ADMINISTRATIVE MASTER ACTIONS
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

  // 4. AUTOMATIC ID GENERATION & MULTI-CHANNEL DISPATCH
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
      // Update Database
      await updateDoc(doc(db, "course_applications", student.id), {
        studentId: generatedID,
        status: "Admitted",
        idAssignedAt: serverTimestamp(),
      });

      // Dispatch Email
      window.open(
        `mailto:${student.email}?subject=${emailSubject}&body=${messageBody}`,
        "_blank",
      );

      // Dispatch WhatsApp
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

  // 5. DIRECT CERTIFICATE ISSUANCE
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

  // 6. DIRECT USER/SUPERVISOR MESSAGING
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
      window.open(
        `https://wa.me/${contact.phone || contact.phone}?text=${text}`,
        "_blank",
      );
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
      {/* SIDEBAR */}
      <aside
        className={`w-80 border-r flex flex-col ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xl"}`}
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
              id: "surveillance",
              icon: <Eye size={20} />,
              label: "Chat Intelligence",
            },
            {
              id: "history",
              icon: <History size={20} />,
              label: "System Logs",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] font-black text-xs uppercase transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-xl scale-105" : "hover:bg-blue-500/10 opacity-60"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div className="mt-12 p-6 bg-slate-500/5 rounded-3xl border border-slate-500/10">
            <p className="text-[9px] font-black uppercase opacity-50 mb-4 tracking-widest text-center">
              Supervisor Comms
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => directMessage("supervisor", "email")}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:text-blue-500 transition-colors"
              >
                <Mail size={18} />
              </button>
              <button
                onClick={() => directMessage("supervisor", "whatsapp")}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:text-emerald-500 transition-colors"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </nav>

        <div className="p-8 space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full py-4 flex items-center justify-center gap-4 bg-slate-500/10 rounded-2xl"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-blue-500" />
            )}
            <span className="font-black text-[10px] uppercase">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          <button
            onClick={() => auth.signOut()}
            className="w-full py-5 bg-red-600/10 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={20} className="inline mr-2" /> Shutdown Session
          </button>
        </div>
      </aside>

      {/* MAIN CONSOLE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-28 border-b flex items-center justify-between px-12 bg-white/5 backdrop-blur-3xl shrink-0">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40 text-emerald-500">
                Gross Revenue (Verified)
              </span>
              <div className="text-3xl font-black tracking-tighter text-emerald-500">
                ₦{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="w-[1px] h-12 bg-slate-500/20"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40 text-blue-500">
                Registered Talent
              </span>
              <div className="text-3xl font-black tracking-tighter text-blue-500">
                {students.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-500/5 px-6 py-3 rounded-2xl border border-slate-500/10">
              <div
                className={`w-3 h-3 rounded-full ${portalStatus ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-red-500 shadow-[0_0_15px_#ef4444]"}`}
              ></div>
              <span className="text-[11px] font-black uppercase">
                Portal: {portalStatus ? "Active" : "Locked"}
              </span>
            </div>
            <button
              onClick={togglePortal}
              className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-2xl ${portalStatus ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
            >
              {portalStatus ? "Initiate Lockdown" : "Open System Access"}
            </button>
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto">
          {activeTab === "admissions" && (
            <div
              className={`rounded-[3rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
            >
              <table className="w-full text-left">
                <thead className="bg-slate-500/5 text-[11px] font-black uppercase tracking-widest opacity-60">
                  <tr>
                    <th className="p-8">Student Identity</th>
                    <th className="p-8">Financial Clearance</th>
                    <th className="p-8">Credentialing</th>
                    <th className="p-8 text-center">Global Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/10 font-bold">
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-500/5 transition-all"
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <img
                            src={s.passportUrl}
                            className="w-14 h-14 rounded-[1.2rem] object-cover border-2 border-blue-600/30"
                          />
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight">
                              {s.studentName}
                            </p>
                            <p className="text-[10px] text-blue-500 uppercase">
                              {s.course}
                            </p>
                          </div>
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
                            <Zap
                              size={16}
                              className="text-purple-500 fill-purple-500/20"
                            />
                            <span className="font-mono text-xs font-black tracking-tighter">
                              {s.studentId}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAutomaticIDDispatch(s)}
                            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-900 transition-all"
                          >
                            <UserCheck size={16} /> Verify & Dispatch
                          </button>
                        )}
                      </td>
                      <td className="p-8">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => issueCertificate(s)}
                            className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl hover:bg-amber-500 hover:text-white transition-all"
                            title="Issue Certificate"
                          >
                            <Award size={20} />
                          </button>
                          <button
                            onClick={() => directMessage(s, "email")}
                            className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                          >
                            <Mail size={20} />
                          </button>
                          <button
                            onClick={() => directMessage(s, "whatsapp")}
                            className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <MessageSquare size={20} />
                          </button>
                        </div>
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

          {activeTab === "history" && (
            <div
              className={`rounded-[3rem] border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-2xl"}`}
            >
              <table className="w-full text-left">
                <thead className="bg-slate-500/5 text-[11px] font-black uppercase tracking-widest opacity-60">
                  <tr>
                    <th className="p-8">Audit Time</th>
                    <th className="p-8">Protocol</th>
                    <th className="p-8">Operational Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/10 font-bold">
                  {historyLogs.map((log) => (
                    <tr key={log.id} className="text-xs">
                      <td className="p-8 opacity-40">
                        {log.timestamp?.toDate().toLocaleString()}
                      </td>
                      <td className="p-8">
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded-lg font-black uppercase text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-8 italic opacity-70">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .metric-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.15em; }
        .stat-card { padding: 50px; border-radius: 50px; background: ${darkMode ? "#0f172a" : "white"}; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-10px); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
