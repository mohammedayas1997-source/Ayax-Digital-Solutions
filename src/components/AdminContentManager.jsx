import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Trash2, Save, AlertCircle } from "lucide-react";

const AdminContentManager = () => {
  const [courseId, setCourseId] = useState("software_eng");
  const [weekNum, setWeekNum] = useState(1);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    isLocked: false,
  });

  const handleCommit = async () => {
    // Tabbatar an cika muhimman wurare
    if (!content.title || !content.videoUrl) {
      alert(
        "SYSTEM ERROR: Please enter Module Title and Video URL before committing.",
      );
      return;
    }

    try {
      // Create reference: courses -> [courseId] -> weeks -> week_[num]
      const docRef = doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

      await setDoc(
        docRef,
        {
          ...content,
          weekNumber: Number(weekNum), // Tabbatar lamba ce
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ); // 'merge' yana hana goge tsohon data idan ana son update ne kawai

      alert(`DATABASE UPDATED: Week ${weekNum} is now live for ${courseId}.`);

      // Clear inputs bayan an gama (Optional)
      setContent({
        title: "",
        videoUrl: "",
        pdfUrl: "",
        assignment: "",
        isLocked: false,
      });
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("CRITICAL ERROR: Could not connect to Firestore.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Save size={24} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Content Committer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Target Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 transition-all"
            >
              <option value="software_eng">Software Engineering</option>
              <option value="cyber_security">Cyber Security</option>
              <option value="web_dev">Web Development</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Week Number
            </label>
            <input
              type="number"
              value={weekNum}
              onChange={(e) => setWeekNum(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Module Title
            </label>
            <input
              value={content.title}
              placeholder="e.g., Introduction to Firebase"
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600"
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Video Link (YouTube)
            </label>
            <input
              value={content.videoUrl}
              placeholder="https://youtube.com/..."
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600"
              onChange={(e) =>
                setContent({ ...content, videoUrl: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              PDF Resource Link
            </label>
            <input
              value={content.pdfUrl}
              placeholder="Google Drive link"
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600"
              onChange={(e) =>
                setContent({ ...content, pdfUrl: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
              Assignment Description
            </label>
            <textarea
              value={content.assignment}
              placeholder="Describe the task for this week..."
              className="w-full bg-slate-800 p-4 rounded-2xl font-bold outline-none h-32 border-2 border-transparent focus:border-blue-600"
              onChange={(e) =>
                setContent({ ...content, assignment: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <button
            onClick={handleCommit}
            className="flex-1 bg-blue-600 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save size={18} /> Push to Student Portal
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-gray-500 bg-slate-800/50 p-4 rounded-xl">
          <AlertCircle size={16} />
          <p className="text-[10px] font-bold uppercase">
            Note: Changes are reflected instantly on the student dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminContentManager;
