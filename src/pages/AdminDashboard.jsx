import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Users,
  BookOpen,
  Send,
  Mail,
  MessageSquare,
  PlusCircle,
  LayoutGrid,
  CheckCircle,
  Calendar,
  Video,
  FileText,
  ClipboardList,
  Moon,
  Sun,
  Trash2,
  Reply,
  ShieldAlert,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("lms"); // Default to manager
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Data States
  const [inquiries, setInquiries] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Form States
  const [weekData, setWeekData] = useState({
    startDate: "",
    endDate: "",
    videoId: "",
    pdfUrl: "",
    assignment: "",
    title: "",
  });

  const [replyText, setReplyText] = useState({});

  // 1. Fetch Inquiries & Forum Threads
  useEffect(() => {
    const unsubInquiries = onSnapshot(
      query(collection(db, "inquiries"), orderBy("createdAt", "desc")),
      (snap) => setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    const unsubForum = onSnapshot(
      query(collection(db, "forum_threads"), orderBy("createdAt", "desc")),
      (snap) =>
        setForumThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubInquiries();
      unsubForum();
    };
  }, []);

  // 2. Load Week Data when week selection changes
  useEffect(() => {
    const fetchWeekSettings = async () => {
      const docRef = doc(db, "course_settings", `week_${selectedWeek}`);
      const docSnap = await getDocs(query(collection(db, "course_settings")));
      // Optimized: find specific week
      const specificWeek = docSnap.docs.find(
        (d) => d.id === `week_${selectedWeek}`,
      );
      if (specificWeek) {
        const data = specificWeek.data();
        setWeekData({
          ...data,
          startDate: data.startDate?.toDate().toISOString().split("T")[0] || "",
          endDate: data.endDate?.toDate().toISOString().split("T")[0] || "",
        });
      } else {
        setWeekData({
          startDate: "",
          endDate: "",
          videoId: "",
          pdfUrl: "",
          assignment: "",
          title: "",
        });
      }
    };
    fetchWeekSettings();
  }, [selectedWeek]);

  // 3. Handle Weekly Update (The "Real-Life" Setter)
  const handleUpdateWeek = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const weekRef = doc(db, "course_settings", `week_${selectedWeek}`);
      await setDoc(
        weekRef,
        {
          ...weekData,
          startDate: new Date(weekData.startDate),
          endDate: new Date(weekData.endDate),
          updatedAt: serverTimestamp(),
          weekNumber: selectedWeek,
        },
        { merge: true },
      );

      alert(`System Updated: Week ${selectedWeek} is now live.`);
    } catch (error) {
      console.error(error);
      alert("Critical Error: Update Failed");
    } finally {
      setLoading(false);
    }
  };

  // 4. Forum Reply Logic
  const handleForumReply = async (threadId) => {
    if (!replyText[threadId]) return;
    try {
      const threadRef = doc(db, "forum_threads", threadId);
      await updateDoc(threadRef, {
        adminReply: replyText[threadId],
        repliedAt: serverTimestamp(),
        status: "resolved",
      });
      setReplyText({ ...replyText, [threadId]: "" });
      alert("Reply Dispatched to Student Dashboard");
    } catch (err) {
      alert("Transmission Failed");
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`w-72 border-r p-8 flex flex-col ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}
      >
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-600">
            AYAX{" "}
            <span className={darkMode ? "text-white" : "text-slate-900"}>
              ADMIN
            </span>
          </h2>
          <p className="text-[10px] font-black opacity-50 tracking-[0.3em] uppercase mt-2">
            Command Center v3.0
          </p>
        </div>

        <nav className="space-y-3 flex-1">
          {[
            {
              id: "lms",
              label: "Course Manager",
              icon: <BookOpen size={18} />,
            },
            {
              id: "forum",
              label: "Forum Support",
              icon: <MessageSquare size={18} />,
            },
            {
              id: "inquiries",
              label: "Inbound Leads",
              icon: <Mail size={18} />,
            },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === btn.id ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "opacity-50 hover:opacity-100"}`}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`mt-auto flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-gray-200 text-slate-600"}`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
          {darkMode ? "Switch to Light" : "Switch to Dark"}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {activeTab} Terminal
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Network: encrypted
            </div>
          </div>
        </header>

        {/* 1. COURSE MANAGER (WEEKLY SETTINGS) */}
        {activeTab === "lms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-2">
              <div
                className={`p-10 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                    <PlusCircle className="text-blue-600" /> Configure Week{" "}
                    {selectedWeek}
                  </h2>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className={`p-3 rounded-xl font-black text-xs border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"}`}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Select Week {num}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleUpdateWeek} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">Access Start Date</label>
                      <input
                        type="date"
                        className="admin-input"
                        value={weekData.startDate}
                        onChange={(e) =>
                          setWeekData({
                            ...weekData,
                            startDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Access End Date</label>
                      <input
                        type="date"
                        className="admin-input"
                        value={weekData.endDate}
                        onChange={(e) =>
                          setWeekData({ ...weekData, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label">Lesson Title</label>
                    <input
                      className="admin-input"
                      placeholder="e.g. Advanced Cryptography Basics"
                      value={weekData.title}
                      onChange={(e) =>
                        setWeekData({ ...weekData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">YouTube Video ID</label>
                      <div className="relative">
                        <Video
                          size={16}
                          className="absolute left-4 top-4 opacity-40"
                        />
                        <input
                          className="admin-input pl-12"
                          placeholder="dQw4w9WgXcQ"
                          value={weekData.videoId}
                          onChange={(e) =>
                            setWeekData({
                              ...weekData,
                              videoId: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label">PDF Documentation URL</label>
                      <div className="relative">
                        <FileText
                          size={16}
                          className="absolute left-4 top-4 opacity-40"
                        />
                        <input
                          className="admin-input pl-12"
                          placeholder="https://drive.google.com/..."
                          value={weekData.pdfUrl}
                          onChange={(e) =>
                            setWeekData({ ...weekData, pdfUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label">Weekly Assignment Brief</label>
                    <textarea
                      className="admin-input h-32 pt-4"
                      placeholder="Describe the tasks for this week..."
                      value={weekData.assignment}
                      onChange={(e) =>
                        setWeekData({ ...weekData, assignment: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 shadow-2xl shadow-blue-900/40 disabled:opacity-50"
                  >
                    {loading
                      ? "Syncing with Database..."
                      : "Publish to Student Portal"}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`p-8 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <h3 className="font-black uppercase text-[10px] tracking-widest text-blue-500 mb-6">
                  Configuration Preview
                </h3>
                <div className="space-y-4 opacity-60 italic text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Status</span>{" "}
                    <span className="text-emerald-500">Auto-Unlock Active</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Target</span> <span>All Registered Students</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Week</span> <span>{selectedWeek} / 24</span>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-blue-500 leading-relaxed">
                    Note: Setting the Start Date will automatically lock/unlock
                    the content for students based on their local system time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FORUM SUPPORT & REPLIES */}
        {activeTab === "forum" && (
          <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
            {forumThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-8 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white">
                      {thread.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-tight">
                        {thread.studentName}
                      </h4>
                      <p className="text-[10px] font-bold opacity-40 uppercase">
                        {thread.courseId} • {thread.studentType}
                      </p>
                    </div>
                  </div>
                  {thread.status === "resolved" ? (
                    <span className="px-4 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-black text-[8px] uppercase">
                      Resolved
                    </span>
                  ) : (
                    <span className="px-4 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-black text-[8px] uppercase flex items-center gap-2">
                      <ShieldAlert size={10} /> Action Required
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black italic uppercase mb-2">
                  "{thread.title}"
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {thread.content}
                </p>

                {thread.adminReply && (
                  <div className="mb-6 p-6 bg-blue-600/5 border-l-4 border-blue-600 rounded-r-2xl italic text-sm">
                    <span className="block font-black uppercase text-[8px] text-blue-600 mb-2">
                      Previous Official Reply:
                    </span>
                    "{thread.adminReply}"
                  </div>
                )}

                <div className="flex gap-4">
                  <input
                    className="admin-input flex-1"
                    placeholder="Type official response..."
                    value={replyText[thread.id] || ""}
                    onChange={(e) =>
                      setReplyText({
                        ...replyText,
                        [thread.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => handleForumReply(thread.id)}
                    className="px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Reply size={14} /> Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. INBOUND INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {inquiries.map((item) => (
              <div
                key={item.id}
                className={`p-8 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
              >
                <div className="flex justify-between mb-4">
                  <span className="text-[8px] font-black uppercase px-3 py-1 bg-blue-600 text-white rounded-full tracking-[0.2em]">
                    {item.serviceTier}
                  </span>
                  <p className="text-[10px] font-bold opacity-40">
                    {new Date(
                      item.createdAt?.seconds * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <h4 className="text-xl font-black italic uppercase">
                  {item.fullName}
                </h4>
                <p className="text-sm font-bold text-blue-500 mb-4">
                  {item.email}
                </p>
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed ${darkMode ? "bg-slate-950 border-slate-800" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className="text-sm italic opacity-70 leading-relaxed">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <a
                    href={`mailto:${item.email}`}
                    className="flex-1 py-3 bg-gray-900 text-white text-center rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all"
                  >
                    Direct Email
                  </a>
                  <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .admin-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: ${darkMode ? "#0f172a" : "#f8fafc"};
          border: 2px solid ${darkMode ? "#1e293b" : "#f1f5f9"};
          border-radius: 1.25rem;
          font-weight: 800;
          font-size: 0.75rem;
          color: ${darkMode ? "white" : "#1e293b"};
          outline: none;
          transition: 0.3s;
        }
        .admin-input:focus {
          border-color: #2563eb;
          background: ${darkMode ? "#1e293b" : "white"};
        }
        .label {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #64748b;
          display: block;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
