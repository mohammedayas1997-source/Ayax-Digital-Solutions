import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
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
  Loader2,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("lms");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialSync, setInitialSync] = useState(true); // Added to prevent blank screen flicker

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
      (snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setInitialSync(false);
      },
      (error) => {
        console.error("Inquiry Sync Error:", error);
        setInitialSync(false);
      },
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

  // 2. Load Week Data - FIXED CRASH LOGIC
  useEffect(() => {
    const fetchWeekSettings = async () => {
      try {
        const docRef = doc(db, "course_settings", `week_${selectedWeek}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Safety Date Parser: If date is missing or not a timestamp, don't crash with .toISOString()
          const parseDate = (dateField) => {
            if (dateField?.toDate)
              return dateField.toDate().toISOString().split("T")[0];
            if (typeof dateField === "string" && dateField.length > 0)
              return dateField;
            return "";
          };

          setWeekData({
            title: data.title || "",
            videoId: data.videoId || "",
            pdfUrl: data.pdfUrl || "",
            assignment: data.assignment || "",
            startDate: parseDate(data.startDate),
            endDate: parseDate(data.endDate),
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
      } catch (error) {
        console.error("Error fetching week settings:", error);
      }
    };
    fetchWeekSettings();
  }, [selectedWeek]);

  // 3. Handle Weekly Update
  const handleUpdateWeek = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const weekRef = doc(db, "course_settings", `week_${selectedWeek}`);
      await setDoc(
        weekRef,
        {
          ...weekData,
          // Store as native JS Dates for Firestore Timestamp conversion
          startDate: weekData.startDate ? new Date(weekData.startDate) : null,
          endDate: weekData.endDate ? new Date(weekData.endDate) : null,
          updatedAt: serverTimestamp(),
          weekNumber: selectedWeek,
        },
        { merge: true },
      );

      alert(
        `System Updated: Week ${selectedWeek} configuration is now synchronized.`,
      );
    } catch (error) {
      console.error(error);
      alert("CRITICAL_SYNC_FAILURE: Database connection interrupted.");
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
      alert(
        "AUTHORITY_RESPONSE: Reply successfully injected into student feed.",
      );
    } catch (err) {
      alert("TRANSMISSION_FAILED");
    }
  };

  // PREVENT BLANK SCREEN: Show Loader if first sync isn't done
  if (initialSync) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs">
          Decrypting Terminal Data...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`w-72 border-r p-8 flex flex-col sticky top-0 h-screen ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}
      >
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-600">
            AYAX{" "}
            <span className={darkMode ? "text-white" : "text-slate-900"}>
              ADMIN
            </span>
          </h2>
          <p className="text-[10px] font-black opacity-50 tracking-[0.3em] uppercase mt-2 text-blue-400">
            Secure Command v3.0
          </p>
        </div>

        <nav className="space-y-3 flex-1">
          {[
            { id: "lms", label: "LMS Manager", icon: <BookOpen size={18} /> },
            {
              id: "forum",
              label: "Forum Patrol",
              icon: <MessageSquare size={18} />,
            },
            {
              id: "inquiries",
              label: "Lead Registry",
              icon: <Mail size={18} />,
            },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === btn.id ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "opacity-50 hover:opacity-100"}`}
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
          {darkMode ? "Light Protocol" : "Dark Protocol"}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            {activeTab}
            <br />
            <span className="text-blue-600 text-2xl">Terminal Control</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Node: Secured
            </div>
          </div>
        </header>

        {/* 1. COURSE MANAGER */}
        {activeTab === "lms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="lg:col-span-2">
              <div
                className={`p-10 rounded-[3.5rem] border ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-gray-100 shadow-xl"}`}
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg">
                      <PlusCircle size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">
                      Configuration: Week {selectedWeek}
                    </h2>
                  </div>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className={`p-4 rounded-2xl font-black text-xs outline-none border ${darkMode ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"}`}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Index Week {num}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleUpdateWeek} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="label">Access Commencement</label>
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
                    <div className="space-y-3">
                      <label className="label">Access Expiration</label>
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

                  <div className="space-y-3">
                    <label className="label">Lesson Objective / Title</label>
                    <input
                      className="admin-input"
                      placeholder="e.g. Advanced System Architecture Fundamentals"
                      value={weekData.title}
                      onChange={(e) =>
                        setWeekData({ ...weekData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="label">
                        Video Payload (YouTube ID)
                      </label>
                      <input
                        className="admin-input"
                        placeholder="ID ONLY (e.g. dQw4w9WgXcQ)"
                        value={weekData.videoId}
                        onChange={(e) =>
                          setWeekData({ ...weekData, videoId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="label">
                        Asset Link (PDF Documentation)
                      </label>
                      <input
                        className="admin-input"
                        placeholder="Direct Cloud Link"
                        value={weekData.pdfUrl}
                        onChange={(e) =>
                          setWeekData({ ...weekData, pdfUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label">Assignment Specification</label>
                    <textarea
                      className="admin-input h-40 pt-5 resize-none"
                      placeholder="Describe the technical requirements for this module..."
                      value={weekData.assignment}
                      onChange={(e) =>
                        setWeekData({ ...weekData, assignment: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-700 shadow-2xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading
                      ? "Establishing Database Handshake..."
                      : "Push Configuration to Live Portal"}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-8">
              <div
                className={`p-8 rounded-[3rem] border ${darkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white shadow-xl border-gray-100"}`}
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-6 flex items-center gap-2">
                  <ClipboardList size={14} /> Audit Preview
                </h3>
                <div className="space-y-4 text-xs font-bold opacity-60 italic">
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span>Global State</span>
                    <span className="text-emerald-500">Encrypted</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span>Visibility</span>
                    <span>All Authorized Students</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span>Week Index</span>
                    <span>{selectedWeek} / 24</span>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-blue-600/10 border border-blue-600/20 rounded-3xl">
                  <p className="text-[9px] font-black uppercase text-blue-500 leading-relaxed text-center">
                    Caution: Any changes here bypass student approval and
                    reflect instantly on the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FORUM PATROL */}
        {activeTab === "forum" && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-right-10 duration-700">
            {forumThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-10 rounded-[3.5rem] border ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-500/20">
                      {thread.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-lg tracking-tighter">
                        {thread.studentName}
                      </h4>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        Node: {thread.courseId} • {thread.studentType}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest border ${thread.status === "resolved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"}`}
                  >
                    {thread.status === "resolved"
                      ? "Closed"
                      : "Awaiting Authority"}
                  </span>
                </div>

                <h3 className="text-2xl font-black italic uppercase mb-3 tracking-tight">
                  "{thread.title}"
                </h3>
                <p
                  className={`text-sm font-medium leading-relaxed mb-8 opacity-70`}
                >
                  {thread.content}
                </p>

                {thread.adminReply && (
                  <div className="mb-8 p-8 bg-blue-600/5 border-l-8 border-blue-600 rounded-[2rem] italic">
                    <span className="block font-black uppercase text-[9px] text-blue-600 mb-2 tracking-widest">
                      Administrator Reply Archive:
                    </span>
                    <p className="text-sm font-bold opacity-80">
                      "{thread.adminReply}"
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <input
                    className="admin-input flex-1 !rounded-[2rem]"
                    placeholder="Input official authority response..."
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
                    className="px-10 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20"
                  >
                    <Reply size={16} /> Inject Response
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. LEADS REGISTRY */}
        {activeTab === "inquiries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
            {inquiries.map((item) => (
              <div
                key={item.id}
                className={`p-10 rounded-[3.5rem] border transition-all hover:scale-[1.02] ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}
              >
                <div className="flex justify-between mb-6">
                  <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-blue-600 text-white rounded-full tracking-widest">
                    {item.serviceTier || "General"}
                  </span>
                  <p className="text-[10px] font-black opacity-30">
                    {item.createdAt?.seconds
                      ? new Date(
                          item.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : "SYNC..."}
                  </p>
                </div>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">
                  {item.fullName}
                </h4>
                <p className="text-[10px] font-black text-blue-500 mb-8 tracking-wider">
                  IDENT: {item.email}
                </p>
                <div
                  className={`p-6 rounded-[2rem] border-2 border-dashed ${darkMode ? "bg-slate-950 border-white/5" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className="text-xs italic font-bold opacity-60 leading-relaxed">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex gap-3 mt-8">
                  <a
                    href={`mailto:${item.email}`}
                    className="flex-1 py-4 bg-slate-800 text-white text-center rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Reply via Email
                  </a>
                  <button className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .admin-input { width: 100%; padding: 1.25rem 1.75rem; background: ${darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc"}; border: 2px solid transparent; border-radius: 2rem; font-weight: 800; font-size: 0.8rem; color: inherit; outline: none; transition: 0.4s; }
        .admin-input:focus { border-color: #2563eb; background: ${darkMode ? "rgba(255,255,255,0.08)" : "white"}; box-shadow: 0 0 40px -10px rgba(37, 99, 235, 0.2); }
        .label { font-size: 0.7rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; display: block; margin-bottom: 0.75rem; margin-left: 0.5rem; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
