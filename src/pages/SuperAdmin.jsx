import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  ShieldCheck,
  Video,
  Award,
  FileText,
  Trash2,
  UserX,
  UserCheck,
  Send,
  Eye,
  CreditCard,
  CheckCircle,
  Phone,
  MessageSquare,
  Loader2,
  Star,
} from "lucide-react";
import { db } from "../firebase"; // Mataki daya sama kadai
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const SuperAdmin = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [adminReply, setAdminReply] = useState("");

  // REAL-TIME DATA SYNC
  useEffect(() => {
    const unsubLessons = onSnapshot(collection(db, "lessons"), (snap) => {
      setLessons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const usersData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSystemUsers(usersData);
      setTeachers(usersData.filter((u) => u.role === "teacher"));
    });
    const unsubStudents = onSnapshot(collection(db, "admissions"), (snap) => {
      setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubServices = onSnapshot(
      query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")),
      (snap) => {
        setServiceRequests(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
    );
    const unsubThreads = onSnapshot(
      query(collection(db, "forum_threads"), orderBy("createdAt", "desc")),
      (snap) => {
        setAllThreads(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    return () => {
      unsubLessons();
      unsubUsers();
      unsubStudents();
      unsubServices();
      unsubThreads();
    };
  }, []);

  // FUNCTIONS
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    await updateDoc(doc(db, "users", id), { status: newStatus });
  };

  const deleteItem = async (col, id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      await deleteDoc(doc(db, col, id));
    }
  };

  const updateStudentStatus = async (id, field, value) => {
    await updateDoc(doc(db, "admissions", id), { [field]: value });
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) return;
    await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
      content: adminReply,
      author: "Super Admin",
      role: "admin",
      createdAt: serverTimestamp(),
    });
    setAdminReply("");
  };

  return (
    <div
      className={`min-h-screen p-6 md:p-12 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* NAVIGATION BAR */}
      <div className="flex flex-wrap gap-4 mb-12 border-b border-gray-200 pb-6">
        {[
          "overview",
          "curriculum",
          "instructors",
          "students",
          "global_forum",
          "services",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`nav-link ${activeTab === tab ? "active-nav" : ""}`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {/* 1. OVERVIEW: ACTIVITY FEED */}
        {activeTab === "overview" && (
          <div
            className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
          >
            <div className="p-8 border-b bg-gray-50/5 flex items-center gap-3">
              <Activity size={20} className="text-blue-600" />
              <h3 className="font-black uppercase text-xs tracking-widest">
                Global Activity Feed
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50/5 text-[10px] font-black text-gray-400 uppercase">
                <tr>
                  <th className="p-6">User</th>
                  <th className="p-6">Role</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/10">
                {systemUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/5">
                    <td className="p-6">
                      <p className="font-black text-sm">{user.fullName}</p>
                      <p className="text-[10px] text-gray-400">{user.email}</p>
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-6 text-xs font-bold italic">
                      "{user.currentActivity || "Browsing"}"
                    </td>
                    <td className="p-6 text-[10px] font-black text-gray-400">
                      {user.lastInteraction
                        ? user.lastInteraction.toDate().toLocaleTimeString()
                        : "Waiting..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. CURRICULUM STREAM */}
        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Live Curriculum Stream
            </h3>
            <div className="grid gap-4">
              {lessons.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-[2rem] border flex items-center justify-between ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`p-4 rounded-2xl ${item.type === "video" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      {item.type === "video" ? (
                        <Video size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase">
                        {item.course} • Week {item.week}
                      </p>
                      <h4 className="font-black">{item.title}</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem("lessons", item.id)}
                    className="p-3 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. INSTRUCTOR DIRECTORY */}
        {activeTab === "instructors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-black text-slate-900">
                    {teacher.fullName}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {teacher.email}
                  </p>
                  <div
                    className={`mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${teacher.status === "suspended" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                  >
                    {teacher.status || "active"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(teacher.id, teacher.status)}
                    className={`p-3 rounded-2xl ${teacher.status === "suspended" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    {teacher.status === "suspended" ? (
                      <UserCheck size={18} />
                    ) : (
                      <UserX size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => deleteItem("users", teacher.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. ADMISSIONS & FINANCE */}
        {activeTab === "students" && (
          <div
            className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50/5 border-b border-gray-100/10">
                <tr className="text-[10px] font-black uppercase text-gray-400">
                  <th className="p-6">Student</th>
                  <th className="p-6">Receipt</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/10">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={s.passportUrl}
                          className="w-12 h-12 rounded-2xl object-cover"
                          alt=""
                        />
                        <div>
                          <p className="font-black text-sm">{s.studentName}</p>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">
                            {s.course}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => window.open(s.receiptUrl, "_blank")}
                        className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2"
                      >
                        <Eye size={14} /> VIEW
                      </button>
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === "Admitted" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                      >
                        {s.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-6 flex justify-center gap-2">
                      <button
                        onClick={() =>
                          updateStudentStatus(s.id, "paymentStatus", "Verified")
                        }
                        className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200"
                      >
                        <CreditCard size={16} />
                      </button>
                      <button
                        onClick={() =>
                          updateStudentStatus(s.id, "status", "Admitted")
                        }
                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. GLOBAL FORUM MONITORING */}
        {activeTab === "global_forum" && (
          <div className="flex gap-8 h-[70vh]">
            <div
              className={`w-1/3 p-8 rounded-[2.5rem] border shadow-xl flex flex-col ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
            >
              <h3 className="font-black italic uppercase text-xs mb-6">
                Discussion Threads
              </h3>
              <div className="overflow-y-auto flex-1 space-y-2">
                {allThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${activeThread?.id === thread.id ? "bg-blue-600 text-white" : "hover:bg-gray-50 border"}`}
                  >
                    <p className="text-[10px] font-black uppercase opacity-60">
                      {thread.course}
                    </p>
                    <p className="font-bold text-sm truncate">{thread.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex-1 rounded-[2.5rem] shadow-2xl border flex flex-col overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
            >
              {activeThread ? (
                <>
                  <div className="p-8 border-b bg-gray-50/5">
                    <h3 className="font-black text-2xl mb-2">
                      {activeThread.title}
                    </h3>
                    <p className="text-sm opacity-70">{activeThread.content}</p>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto">
                    <div className="bg-red-600 text-white p-5 rounded-[2rem] rounded-tr-none ml-auto max-w-[80%] shadow-xl">
                      <p className="text-[10px] font-black uppercase mb-1 opacity-70">
                        Administrator Authority
                      </p>
                      <p className="text-sm font-bold">
                        Inject administrative response as Super Admin.
                      </p>
                    </div>
                  </div>
                  <form
                    onSubmit={handleAdminReply}
                    className="p-6 border-t border-gray-100/10 flex gap-4"
                  >
                    <input
                      className="admin-input"
                      placeholder="Inject official response..."
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                    />
                    <button className="p-5 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-black transition-all">
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <ShieldCheck size={100} />
                  <p className="font-black uppercase tracking-widest text-xs mt-4">
                    Select Thread to Monitor
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. SERVICE REQUESTS */}
        {activeTab === "services" && (
          <div className="grid md:grid-cols-2 gap-6">
            {serviceRequests.length > 0 ? (
              serviceRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-6 rounded-[2rem] border shadow-sm flex flex-col ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[9px] font-black rounded-full uppercase">
                      {req.serviceType || "General"}
                    </span>
                    <button
                      onClick={() => window.open(`tel:${req.phone}`)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Phone size={14} />
                    </button>
                  </div>
                  <h4 className="font-black text-lg">{req.clientName}</h4>
                  <p className="text-sm opacity-60 font-medium mb-4 flex-1">
                    {req.projectDescription || req.message}
                  </p>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-blue-600 uppercase">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={12} /> {req.email}
                    </div>
                    <span className="text-slate-400">
                      {req.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-20 text-center font-black text-gray-300 uppercase tracking-[0.5em]">
                No new service requests detected.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .nav-link { padding: 12px 24px; border-radius: 16px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; transition: 0.3s; }
        .nav-link:hover { background: #f1f5f9; }
        .active-nav { background: #2563eb !important; color: white !important; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4); }
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? "#0f172a" : "#f8fafc"}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; font-size: 0.85rem; outline: none; transition: 0.3s; color: ${darkMode ? "white" : "black"}; }
        .admin-input:focus { border-color: #2563eb; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;
