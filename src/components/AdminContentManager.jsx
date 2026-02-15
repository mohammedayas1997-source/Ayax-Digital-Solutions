import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import {
  Trash2,
  Save,
  AlertCircle,
  RefreshCcw,
  Calendar,
  Clock,
} from "lucide-react";

const AdminContentManager = () => {
  const [courseId, setCourseId] = useState("software_eng");
  const [weekNum, setWeekNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    startDate: "", // Zai dauki Date da Time
  });

  // Reference helper
  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  const handleCommit = async () => {
    if (!content.title || !content.videoUrl || !content.startDate) {
      alert("SYSTEM ERROR: Title, Video URL, and Release Date are mandatory.");
      return;
    }

    setLoading(true);
    try {
      // Muna maida string din date zuwa Firebase Timestamp
      const releaseDate = new Date(content.startDate);

      await setDoc(
        getDocRef(),
        {
          ...content,
          startDate: releaseDate, // Ana adanawa a matsayin Timestamp
          weekNumber: Number(weekNum),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      alert(
        `SUCCESS: Week ${weekNum} has been synchronized and locked until ${content.startDate}`,
      );
    } catch (error) {
      console.error("Sync Error:", error);
      alert("CRITICAL ERROR: Database connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `DANGER: Are you sure you want to PERMANENTLY delete Week ${weekNum}?`,
    );

    if (confirmDelete) {
      setLoading(true);
      try {
        await deleteDoc(getDocRef());
        alert(`DELETED: Week ${weekNum} is no longer available.`);
        setContent({
          title: "",
          videoUrl: "",
          pdfUrl: "",
          assignment: "",
          startDate: "",
        });
      } catch (error) {
        alert("DELETE ERROR: Could not remove document.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl animate-pulse">
              <Save size={24} />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              System Commander
            </h2>
          </div>
          {loading && <RefreshCcw className="animate-spin text-blue-500" />}
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Target Stream
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 transition-all text-blue-400"
            >
              <option value="software_eng">Software Engineering</option>
              <option value="cyber_security">Cyber Security</option>
              <option value="data_analytics">Data Analytics</option>
              <option value="ai_tech">Artificial Intelligence</option>
              <option value="blockchain">Blockchain Technology</option>
              <option value="web_dev">Web Development</option>
              <option value="digital_marketing">Digital Marketing</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Temporal Week Index
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={weekNum}
              onChange={(e) => setWeekNum(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 transition-all text-yellow-500"
            />
          </div>
        </div>

        {/* Content Inputs */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Module Title
            </label>
            <input
              value={content.title}
              placeholder="e.g. Advanced React Architecture"
              className="admin-input-style"
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
          </div>

          {/* RELEASE DATE & TIME - WANNAN SHINE GYARAN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-2 flex items-center gap-2">
              <Clock size={12} /> Scheduled Release (Date & Time)
            </label>
            <input
              type="datetime-local"
              value={content.startDate}
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none border-2 border-blue-600/30 focus:border-blue-500 transition-colors text-blue-400"
              onChange={(e) =>
                setContent({ ...content, startDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
                Video Payload (ID)
              </label>
              <input
                value={content.videoUrl}
                placeholder="YouTube Video ID"
                className="admin-input-style"
                onChange={(e) =>
                  setContent({ ...content, videoUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
                PDF Asset Link
              </label>
              <input
                value={content.pdfUrl}
                placeholder="Cloud URL"
                className="admin-input-style"
                onChange={(e) =>
                  setContent({ ...content, pdfUrl: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Assignment Brief
            </label>
            <textarea
              value={content.assignment}
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none h-32 border-2 border-transparent focus:border-blue-500"
              onChange={(e) =>
                setContent({ ...content, assignment: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <button
            onClick={handleCommit}
            disabled={loading}
            className="flex-[2] bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Save size={18} /> Deploy to Portal
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-900/30 border-2 border-red-900 text-red-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-red-900 hover:text-white transition-all disabled:opacity-50"
          >
            <Trash2 size={18} /> Wipe
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-orange-500 bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
          <AlertCircle size={16} />
          <p className="text-[10px] font-bold uppercase tracking-wider">
            Temporal Synchronization: Week {weekNum} will remain locked for
            students until the specified time.
          </p>
        </div>
      </div>

      <style>{`
        .admin-input-style {
          width: 100%;
          background: #1e293b;
          padding: 1rem;
          border-radius: 1.25rem;
          font-weight: 700;
          outline: none;
          border: 2px solid transparent;
          transition: 0.3s;
        }
        .admin-input-style:focus {
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default AdminContentManager;
