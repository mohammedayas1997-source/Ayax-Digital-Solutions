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
  setDoc
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
  X
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

  // 1. REAL-TIME DATA ENGINE
  useEffect(() => {
    // Applicants Stream
    const unsubStudents = onSnapshot(collection(db, "course_applications"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Chat Threads Stream (Master Surveillance)
    const unsubChats = onSnapshot(query(collection(db, "private_chats"), orderBy("createdAt", "desc")), (snap) => {
      const allMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const uniqueThreads = [];
      const seen = new Set();
      allMsgs.forEach(m => {
        if (!seen.has(m.studentId)) {
          seen.add(m.studentId);
          uniqueThreads.push(m);
        }
      });
      setChats(uniqueThreads);
    });

    // Portal Status
    const unsubPortal = onSnapshot(doc(db, "system_settings", "portal_control"), (docSnap) => {
      if (docSnap.exists()) setPortalStatus(docSnap.data().isOpen);
    });

    // History Logs
    const unsubLogs = onSnapshot(query(collection(db, "admin_logs"), orderBy("timestamp", "desc")), (snap) => {
      setHistoryLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStudents(); unsubChats(); unsubPortal(); unsubLogs();
    };
  }, []);

  // 2. Chat Monitoring Engine
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, "private_chats"), 
      where("studentId", "==", selectedChat.studentId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedChat]);

  // 3. ADMINISTRATIVE ACTIONS
  const logActivity = async (action, details) => {
    await addDoc(collection(db, "admin_logs"), {
      action, details, timestamp: serverTimestamp(), adminEmail: auth.currentUser?.email
    });
  };

  const togglePortal = async () => {
    const newStatus = !portalStatus;
    await setDoc(doc(db, "system_settings", "portal_control"), { isOpen: newStatus });
    logActivity("PORTAL_TOGGLE", `Portal status changed to ${newStatus ? 'OPEN' : 'CLOSED'}`);
  };

  const handleAdmission = async (id, name, currentStatus) => {
    const newStatus = currentStatus === "Admitted" ? "Pending" : "Admitted";
    await updateDoc(doc(db, "course_applications", id), { status: newStatus });
    logActivity("ADMISSION_CHANGE", `Student ${name} status set to ${newStatus}`);
  };

  const handleLogout = async () => {
    if (window.confirm("Logout from Authority Dashboard?")) {
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-72 border-r flex flex-col transition-colors duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"}`}>
        <div className="p-8">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-600">AYAX ADMIN</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mt-1">Control Console</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "overview", icon: <LayoutDashboard size={18}/>, label: "Overview" },
            { id: "admissions", icon: <Users size={18}/>, label: "Admissions" },
            { id: "surveillance", icon: <Eye size={18}/>, label: "Chat Monitor" },
            { id: "history", icon: <History size={18}/>, label: "Audit Logs" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-500/10 opacity-60'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/10 space-y-4">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between p-3 bg-slate-500/10 rounded-xl">
             <span className="text-[10px] font-black uppercase tracking-widest">{darkMode ? "Light Mode" : "Dark Mode"}</span>
             {darkMode ? <Sun size={16} className="text-yellow-400"/> : <Moon size={16} className="text-blue-500"/>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-red-500 font-black text-xs uppercase hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        
        {/* TOP BAR */}
        <header className="h-20 border-b flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
             <div className={`w-3 h-3 rounded-full animate-pulse ${portalStatus ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
             <h3 className="text-sm font-black uppercase tracking-widest">Portal: {portalStatus ? "Live & Accepting" : "Locked / Maintenance"}</h3>
          </div>
          <button onClick={togglePortal} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg ${portalStatus ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            {portalStatus ? "Initiate Lockdown" : "Bypass & Open Portal"}
          </button>
        </header>

        {/* TAB CONTENT */}
        <div className="flex-1 p-10 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <Activity className="text-blue-600 mb-4" />
                <h4 className="metric-label">Total Applicants</h4>
                <p className="text-4xl font-black">{students.length}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <CheckCircle className="text-emerald-500 mb-4" />
                <h4 className="metric-label">Admitted</h4>
                <p className="text-4xl font-black">{students.filter(s => s.status === "Admitted").length}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <MessageSquare className="text-purple-500 mb-4" />
                <h4 className="metric-label">Active Chat Threads</h4>
                <p className="text-4xl font-black">{chats.length}</p>
              </div>
            </div>
          )}

          {/* ADMISSIONS TAB */}
          {activeTab === "admissions" && (
            <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}>
               <table className="w-full text-left">
                  <thead className="bg-slate-500/5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    <tr>
                      <th className="p-6">Student</th>
                      <th className="p-6">Course</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-center">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6 flex items-center gap-4">
                          <img src={s.passportUrl} className="w-10 h-10 rounded-xl object-cover border-2 border-blue-600/20" />
                          <p className="font-black text-sm">{s.studentName}</p>
                        </td>
                        <td className="p-6 font-bold text-xs">{s.course}</td>
                        <td className="p-6 text-[10px] font-black uppercase">
                          <span className={`px-3 py-1 rounded-lg ${s.status === "Admitted" ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{s.status || "Pending"}</span>
                        </td>
                        <td className="p-6 text-center">
                          <button onClick={() => handleAdmission(s.id, s.studentName, s.status)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${s.status === "Admitted" ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {s.status === "Admitted" ? "Revoke" : "Grant Admission"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {/* MASTER SURVEILLANCE TAB (CHAT MONITOR) */}
          {activeTab === "surveillance" && (
            <div className="flex gap-8 h-[70vh]">
              {/* Threads List */}
              <div className={`w-80 rounded-[2.5rem] border overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className="p-6 border-b border-slate-800/10"><h3 className="font-black text-xs uppercase tracking-widest">Active Threads</h3></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {chats.map(chat => (
                    <button key={chat.studentId} onClick={() => setSelectedChat(chat)} className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedChat?.studentId === chat.studentId ? 'bg-blue-600 border-blue-600 text-white' : 'hover:bg-blue-500/10 border-transparent opacity-70'}`}>
                      <p className="font-black text-[11px] truncate uppercase">{chat.sender}</p>
                      <p className="text-[9px] truncate opacity-80 mt-1 italic">Last: {chat.text}</p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Monitor Terminal */}
              <div className={`flex-1 rounded-[2.5rem] border flex flex-col overflow-hidden relative ${darkMode ? 'bg-slate-900 border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]' : 'bg-slate-50 border-slate-100 shadow-2xl'}`}>
                {selectedChat ? (
                  <>
                    <header className="p-6 border-b border-slate-800/10 flex justify-between items-center bg-blue-600 text-white">
                      <div>
                        <h4 className="font-black text-sm uppercase italic">{selectedChat.sender} (Live Monitor)</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80">Surveillance Node Active</p>
                      </div>
                      <ShieldCheck size={20} className="animate-pulse" />
                    </header>
                    <div className="flex-1 p-8 overflow-y-auto space-y-4">
                      {messages.map(m => (
                        <div key={m.id} className={`flex flex-col ${m.senderRole === "student" ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-bold shadow-sm ${m.senderRole === "student" ? 'bg-white text-slate-900 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                            {m.text}
                            <p className="text-[7px] mt-2 uppercase opacity-40 font-black tracking-widest">{m.senderRole} • {m.createdAt?.toDate().toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic">
                    <Eye size={100} className="mb-4 animate-bounce" />
                    <p className="font-black uppercase tracking-widest">Select a thread to monitor conversations</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORY / AUDIT LOGS TAB */}
          {activeTab === "history" && (
            <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}>
              <table className="w-full text-left">
                <thead className="bg-slate-500/5 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Timestamp</th>
                    <th className="p-6">Protocol Action</th>
                    <th className="p-6">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/10">
                  {historyLogs.map(log => (
                    <tr key={log.id} className="text-xs">
                      <td className="p-6 opacity-50 font-bold">{log.timestamp?.toDate().toLocaleString()}</td>
                      <td className="p-6"><span className="px-2 py-1 bg-blue-600/10 text-blue-600 rounded font-black uppercase text-[9px]">{log.action}</span></td>
                      <td className="p-6 font-medium italic opacity-80">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .metric-label { font-[10px] font-black uppercase tracking-widest opacity-40 mb-2; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;