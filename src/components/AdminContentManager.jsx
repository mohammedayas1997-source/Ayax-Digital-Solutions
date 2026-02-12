import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Trash2, Save, AlertCircle, RefreshCcw } from "lucide-react";

const AdminContentManager = () => {
  const [courseId, setCourseId] = useState("software_eng");
  const [weekNum, setWeekNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    isLocked: false,
  });

  // Reference helper don rage maimaita code
  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  const handleCommit = async () => {
    if (!content.title || !content.videoUrl) {
      alert("SYSTEM ERROR: Title and Video URL are mandatory.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(
        getDocRef(),
        {
          ...content,
          weekNumber: Number(weekNum),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      alert(`SUCCESS: Week ${weekNum} has been synchronized.`);
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
        // Reset form
        setContent({
          title: "",
          videoUrl: "",
          pdfUrl: "",
          assignment: "",
          isLocked: false,
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
              <option value="web_dev">Web Development</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Temporal Week Index
            </label>
            <input
              type="number"
              value={weekNum}
              onChange={(e) => setWeekNum(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 transition-all text-yellow-500"
            />
          </div>
        </div>

        {/* Content Inputs */}
        <div className="space-y-5">
          {[
            {
              label: "Module Title",
              key: "title",
              placeholder: "Intro to Algorithms",
            },
            {
              label: "Video Payload (ID/URL)",
              key: "videoUrl",
              placeholder: "YouTube Link",
            },
            {
              label: "PDF Asset Link",
              key: "pdfUrl",
              placeholder: "Cloud Storage Link",
            },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
                {field.label}
              </label>
              <input
                value={content[field.key]}
                placeholder={field.placeholder}
                className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-colors"
                onChange={(e) =>
                  setContent({ ...content, [field.key]: e.target.value })
                }
              />
            </div>
          ))}

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
            Live Override: Existing data for Week {weekNum} will be overwritten
            on deploy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminContentManager;
