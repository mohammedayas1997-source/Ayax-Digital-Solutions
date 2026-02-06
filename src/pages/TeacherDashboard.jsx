import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
  doc,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  BookOpen,
  Video,
  Users,
  PlusCircle,
  Trash2,
  Clock,
  Send,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ChevronRight,
  Search,
  Filter,
  User,
  Loader2,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const TeacherDashboard = ({ teacherName = "Instructor" }) => {
  const [activeTab, setActiveTab] = useState("classroom");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW STATES FOR ENGAGEMENT TRACKER
  const [studentStats, setStudentStats] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const availableCourses = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Cyber Security",
  ];

  // Form State
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoLink: "",
    description: "",
  });

  useEffect(() => {
    if (!selectedCourse) return;

    // 1. Sync Filtered Lessons
    const qLessons = query(
      collection(db, "lessons"),
      where("category", "==", selectedCourse),
      orderBy("createdAt", "desc"),
    );
    const unsubLessons = onSnapshot(qLessons, (snap) => {
      setLessons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const submitGrade = async (submissionId, studentId, gradeData) => {
      try {
        const submissionRef = doc(db, "submissions", submissionId);

        // 1. Update the specific assignment
        await updateDoc(submissionRef, {
          status: gradeData.score >= 50 ? "Graded" : "Needs Revision",
          score: Number(gradeData.score),
          feedback: gradeData.feedback,
          gradedAt: new Date().toISOString(),
        });

        // 2. Optionally update the student's overall average in their profile
        const studentRef = doc(db, "users", studentId);
        await updateDoc(studentRef, {
          totalPoints: increment(Number(gradeData.score)),
          gradedAssignmentsCount: increment(1),
        });

        alert("Evaluation submitted successfully!");
      } catch (error) {
        console.error("Grading Error:", error);
        alert("Failed to submit grade.");
      }
    };

    // 2. Sync Filtered Students
    const qStudents = query(
      collection(db, "course_applications"),
      where("status", "==", "Admitted"),
      where("course", "==", selectedCourse),
    );
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Sync Course Forum
    const qForum = query(
      collection(db, "forum_threads"),
      where("course", "==", selectedCourse),
      orderBy("createdAt", "desc"),
    );
    const unsubForum = onSnapshot(qForum, (snap) => {
      setForumThreads(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 4. Fetch Engagement Stats for Tracker
    fetchEngagementStats();

    return () => {
      unsubLessons();
      unsubStudents();
      unsubForum();
    };
  }, [selectedCourse, selectedWeek]);

  // NEW FUNCTION: Tattara bayanan mu'amalar dalibai
  const fetchEngagementStats = async () => {
    if (!selectedCourse) return;
    setIsStatsLoading(true);
    try {
      const subQ = query(
        collection(db, "submissions"),
        where("courseId", "==", selectedCourse),
        where("weekId", "==", selectedWeek),
      );
      const subSnap = await getDocs(subQ);
      const submissions = subSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const repQ = query(
        collection(db, "forum_replies"),
        where("courseId", "==", selectedCourse),
        where("weekId", "==", selectedWeek),
      );
      const repSnap = await getDocs(repQ);
      const allReplies = repSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const stats = submissions.map((sub) => {
        const studentReplies = allReplies.filter(
          (r) => r.userId === sub.userId,
        );
        return {
          ...sub,
          replies: studentReplies,
          replyCount: studentReplies.length,
          isEligible: studentReplies.length >= 3,
        };
      });
      setStudentStats(stats);
    } catch (err) {
      console.error("Tracker Error:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
        text: reply,
        sender: teacherName,
        role: "instructor",
        createdAt: serverTimestamp(),
      });
      setReply("");
      alert("RESPONSE_DISPATCHED: Student has been notified.");
    } catch (err) {
      alert("ERROR: Failed to send reply.");
    }
  };

  const handleUploadLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "lessons"), {
        title: newLesson.title,
        videoLink: newLesson.videoLink,
        description: newLesson.description,
        category: selectedCourse,
        instructor: teacherName,
        createdAt: serverTimestamp(),
      });

      setNewLesson({ title: "", videoLink: "", description: "" });
      setActiveTab("classroom");
      alert("CONTENT_LIVE: Curriculum updated successfully.");
    } catch (err) {
      alert("UPLOAD_FAILED: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const TeacherDashboard = ({ pendingSubmissions }) => {
    return (
      <div className="space-y-8 p-10 bg-slate-50 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase italic">
              Evaluation Portal
            </h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
              Review student project submissions
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase">
              Queue:{" "}
            </span>
            <span className="text-xs font-black text-blue-600">
              {pendingSubmissions.length} Pending
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {pendingSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col lg:flex-row gap-8 items-center"
            >
              {/* Student Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {sub.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tight">
                      {sub.studentName}
                    </h4>
                    <p className="text-[10px] font-bold text-blue-600 uppercase">
                      Week {sub.week} Project
                    </p>
                  </div>
                </div>
                <a
                  href={sub.workLink}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 underline transition-all"
                >
                  <ExternalLink size={14} /> Open Student Repository
                </a>
              </div>

              {/* Grading Form */}
              <div className="flex-[2] grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    placeholder="85"
                    className="p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-black"
                    id={`score-${sub.id}`}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                    Feedback Notes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Great work on the responsive design..."
                      className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-medium text-sm"
                      id={`feedback-${sub.id}`}
                    />
                    <button
                      onClick={() => {
                        const score = document.getElementById(
                          `score-${sub.id}`,
                        ).value;
                        const feedback = document.getElementById(
                          `feedback-${sub.id}`,
                        ).value;
                        submitGrade(sub.id, sub.studentId, { score, feedback });
                      }}
                      className="px-6 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const deleteLesson = async (lessonId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this lesson from the curriculum?",
      )
    ) {
      try {
        await deleteDoc(doc(db, "lessons", lessonId));
        alert("REMOVED: Lesson deleted.");
      } catch (err) {
        alert("ERROR: Could not delete.");
      }
    }
  };

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-white flex flex-col justify-center">
            <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-blue-500">
              AYAX.OS
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Instructor Initialization
            </p>
            <h2 className="text-2xl font-bold mt-6">Welcome, {teacherName}</h2>
            <p className="text-slate-500 mt-2">
              Select your primary department to access the command center.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {availableCourses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className="bg-white/5 hover:bg-blue-600 border border-white/10 p-6 rounded-[2rem] text-left transition-all group"
              >
                <p className="text-white font-black text-lg group-hover:translate-x-2 transition-transform">
                  {course}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 space-y-10 shrink-0 shadow-sm">
        <h2
          className="text-xl font-black italic text-blue-600 uppercase tracking-tighter cursor-pointer"
          onClick={() => setSelectedCourse(null)}
        >
          AYAX {selectedCourse.split(" ")[0]}
        </h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("classroom")}
            className={`t-nav ${activeTab === "classroom" ? "t-active" : ""}`}
          >
            <LayoutDashboard size={18} /> Classroom
          </button>
          <button
            onClick={() => setActiveTab("forum")}
            className={`t-nav ${activeTab === "forum" ? "t-active" : ""}`}
          >
            <MessageSquare size={18} /> Discussions
          </button>
          <button
            onClick={() => setActiveTab("tracker")}
            className={`t-nav ${activeTab === "tracker" ? "t-active" : ""}`}
          >
            <BarChart3 size={18} /> Engagement Tracker
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`t-nav ${activeTab === "upload" ? "t-active" : ""}`}
          >
            <PlusCircle size={18} /> New Lesson
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`t-nav ${activeTab === "students" ? "t-active" : ""}`}
          >
            <Users size={18} /> Student Roster
          </button>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase text-slate-900">
              {activeTab} Hub
            </h1>
            <p className="text-blue-600 text-xs font-black uppercase tracking-widest">
              {selectedCourse}
            </p>
          </div>
          <button
            onClick={() => setSelectedCourse(null)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            Switch Course
          </button>
        </div>

        {/* --- TRACKER TAB (NEW) --- */}
        {activeTab === "tracker" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Week Selection */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Review Week:
              </span>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-5 py-2 rounded-xl font-black text-xs transition-all ${selectedWeek === w ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  Week {w}
                </button>
              ))}
              {isStatsLoading && (
                <Loader2
                  size={16}
                  className="animate-spin text-blue-600 ml-auto"
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {studentStats.length > 0 ? (
                studentStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8"
                  >
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                          {stat.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">
                            {stat.userName}
                          </p>
                          <p
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${stat.isEligible ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                          >
                            {stat.isEligible ? "Completed" : "Incomplete"}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {stat.replyCount}{" "}
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                          / 3 Replies
                        </span>
                      </div>
                    </div>

                    <div className="md:w-1/2 bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2">
                        Original Submission:
                      </h4>
                      <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                        "{stat.content}"
                      </p>
                    </div>

                    <div className="md:w-1/4 space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-slate-400">
                        Interaction Log:
                      </h4>
                      {stat.replies.map((r, i) => (
                        <div
                          key={i}
                          className="p-3 bg-blue-50 rounded-xl text-[10px] border border-blue-100"
                        >
                          <p className="font-black text-blue-600">
                            Reply to: {r.replyToName}
                          </p>
                          <p className="text-slate-500 line-clamp-1 italic">
                            "{r.replyContent}"
                          </p>
                        </div>
                      ))}
                      {stat.replies.length === 0 && (
                        <div className="text-[10px] font-bold text-slate-300 italic">
                          No activity yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed">
                  <AlertTriangle
                    size={32}
                    className="mx-auto mb-4 text-slate-200"
                  />
                  <p className="font-black uppercase text-xs text-slate-300">
                    No data found for Week {selectedWeek}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FORUM INTERFACE */}
        {activeTab === "forum" && (
          <div className="flex gap-8 h-[70vh] animate-in fade-in duration-500">
            <div className="w-1/3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b font-black uppercase text-[10px] text-slate-400">
                Student Inquiries
              </div>
              <div className="overflow-y-auto flex-1">
                {forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-6 border-b cursor-pointer transition-all ${activeThread?.id === thread.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"}`}
                  >
                    <p className="font-black text-slate-900 text-sm line-clamp-1">
                      {thread.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold italic">
                      By {thread.studentName}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
              {activeThread ? (
                <>
                  <div className="p-8 border-b bg-slate-50/50">
                    <h3 className="font-black text-xl text-slate-900">
                      {activeThread.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                      {activeThread.content}
                    </p>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto space-y-4">
                    <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none self-end max-w-[80%] ml-auto">
                      <p className="text-xs font-bold italic mb-1 uppercase text-blue-200">
                        Instructor {teacherName}
                      </p>
                      <p className="text-sm font-medium italic text-white/90">
                        Awaiting your response to this student...
                      </p>
                    </div>
                  </div>
                  <form
                    onSubmit={handleReply}
                    className="p-6 border-t bg-white flex gap-4"
                  >
                    <input
                      className="t-input"
                      placeholder="Type your expert response..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button className="p-5 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all">
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                  <MessageSquare size={64} className="mb-4 opacity-20" />
                  <p className="font-black uppercase text-xs tracking-[0.3em]">
                    Select a thread to engage
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === "upload" && (
          <div className="max-w-2xl bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 animate-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
              <Video className="text-blue-600" /> Deploy {selectedCourse}{" "}
              Material
            </h2>
            <form onSubmit={handleUploadLesson} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Lesson Title
                </label>
                <input
                  required
                  className="t-input"
                  placeholder="e.g. Introduction to React"
                  value={newLesson.title}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Video URL (YouTube/Vimeo)
                </label>
                <input
                  required
                  className="t-input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={newLesson.videoLink}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, videoLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Description
                </label>
                <textarea
                  required
                  className="t-input h-32 pt-5"
                  placeholder="Explain what this lesson covers..."
                  value={newLesson.description}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, description: e.target.value })
                  }
                />
              </div>

              <button
                disabled={loading}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} /> Publish to {selectedCourse} Curriculum
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* CLASSROOM TAB */}
        {activeTab === "classroom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm group relative hover:shadow-md transition-all"
                >
                  <div className="h-40 bg-slate-900 rounded-[2rem] mb-4 flex flex-col items-center justify-center text-blue-500 font-black italic overflow-hidden">
                    <Video size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] uppercase tracking-widest">
                      Video Active
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 mb-2 truncate pr-8">
                    {lesson.title}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">
                    {lesson.instructor} •{" "}
                    {new Date(lesson.createdAt?.toDate()).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-red-500 hover:text-white text-slate-400 rounded-full transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-300">
                <Video size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase text-xs tracking-widest">
                  No lessons uploaded for this course yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STUDENT ROSTER */}
        {activeTab === "students" && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase text-slate-400 border-b">
                  <th className="p-8">Student Name</th>
                  <th className="p-8">Enrolled Course</th>
                  <th className="p-8 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-8 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs">
                        {std.studentName?.charAt(0)}
                      </div>
                      <p className="font-black text-slate-900 text-sm">
                        {std.studentName}
                      </p>
                    </td>
                    <td className="p-8 font-bold text-xs italic text-blue-600">
                      {std.course}
                    </td>
                    <td className="p-8 text-center">
                      <CheckCircle
                        className="mx-auto text-emerald-500"
                        size={18}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .t-nav { width: 100%; display: flex; align-items: center; gap: 12px; padding: 18px 25px; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #94a3b8; transition: 0.3s; letter-spacing: 0.05em; }
        .t-active { background: #eff6ff; color: #2563eb; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); }
        .t-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-weight: 700; font-size: 0.8rem; outline: none; transition: 0.3s; }
        .t-input:focus { border-color: #2563eb; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
