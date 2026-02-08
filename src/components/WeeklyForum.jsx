import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  MessageSquare,
  CheckCircle,
  Users,
  Pin,
  Send,
  Reply,
  Calendar,
  AlertTriangle,
  Bell,
} from "lucide-react";

// ==========================================
// GYARARREN SUNAYEN COURSES (MAPPING)
// ==========================================
const availableCourses = [
  { id: "cyber_security", name: "Cyber security" },
  { id: "data_analytics", name: "Data Analytics" },
  { id: "software_engineering", name: "Software Engineering" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "blockchain", name: "Blockchain Technology" },
  { id: "web_development", name: "Web development" },
  { id: "digital_marketing", name: "advanced Digital Marketing" },
];

const WeeklyForum = ({ weekId, courseId }) => {
  const [mySubmission, setMySubmission] = useState("");
  const [othersSubmissions, setOthersSubmissions] = useState([]);
  const [repliesCount, setRepliesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [adminAssignment, setAdminAssignment] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [courseDates, setCourseDates] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Nemo sunan course din da ake kai a halin yanzu
  const currentCourseName =
    availableCourses.find((c) => c.id === courseId)?.name || "Unknown Course";

  const user = auth.currentUser;
  const progressPath = `students/${user?.uid}/progress/${courseId}_week_${weekId}`;

  const isExamWeek = weekId === 12 || weekId === 24;

  useEffect(() => {
    if (!user) return;

    // 1. Real-time Chat Sync (onSnapshot)
    const q = query(
      collection(db, "submissions"),
      where("weekId", "==", weekId),
      where("courseId", "==", courseId),
      orderBy("createdAt", "asc"),
    );

    const unsubscribeChat = onSnapshot(q, (snap) => {
      const messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOthersSubmissions(messages);

      const userSub = messages.find((m) => m.userId === user.uid);
      if (userSub) setHasSubmitted(true);
    });

    // 2. Notification Listener for Replies
    const replyQ = query(
      collection(db, "forum_replies"),
      where("parentPostUserId", "==", user.uid),
      where("weekId", "==", weekId),
    );
    const unsubscribeReplies = onSnapshot(replyQ, (snap) => {
      setNotifications(snap.docs.map((d) => d.data()));
    });

    const fetchData = async () => {
      // 3. Fetch Course Schedule/Dates
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists())
        setCourseDates(courseSnap.data().schedule?.[weekId]);

      // 4. Admin Assignment Protocol
      const adminQ = query(
        collection(db, "forum_assignments"),
        where("weekId", "==", weekId),
        where("courseId", "==", courseId),
      );
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) setAdminAssignment(adminSnap.docs[0].data());

      // 5. Completion Status
      const progRef = doc(db, progressPath);
      const progSnap = await getDoc(progRef);
      if (progSnap.exists() && progSnap.data().status === "completed")
        setIsCompleted(true);
    };

    fetchData();
    return () => {
      unsubscribeChat();
      unsubscribeReplies();
    };
  }, [weekId, courseId, user]);

  const handleSubmit = async () => {
    if (mySubmission.trim().length < (isExamWeek ? 500 : 100)) {
      return alert(
        `VALIDATION ERROR: ${isExamWeek ? "EXAM" : "POST"} requires more depth.`,
      );
    }

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        content: mySubmission,
        weekId,
        courseId,
        courseName: currentCourseName, // Mun kara sunan course a submission
        type: isExamWeek ? "EXAM_SUBMISSION" : "chat_message",
        createdAt: serverTimestamp(),
      });
      setMySubmission("");
    } catch (error) {
      alert("NETWORK ERROR: Post failed.");
    }
  };

  const handleReplySubmit = async (peer) => {
    const text = replyText[peer.id];
    if (!text || text.trim().length < 5) return;

    try {
      await addDoc(collection(db, "forum_replies"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        replyContent: text,
        parentPostId: peer.id,
        parentPostUserId: peer.userId,
        weekId,
        courseId,
        createdAt: serverTimestamp(),
      });
      setReplyText((prev) => ({ ...prev, [peer.id]: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-sans">
      {/* HEADER: Date & Exam Status */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900 p-6 rounded-[2rem] text-white">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl ${isExamWeek ? "bg-red-600 animate-pulse" : "bg-blue-600"}`}
          >
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="font-black uppercase tracking-tighter text-xl">
              {currentCourseName} - Week {weekId}{" "}
              {isExamWeek && "- EXAMINATION PERIOD"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Scheduled Date: {courseDates || "TBD BY ADMINISTRATION"}
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-[10px] animate-bounce">
            <Bell size={14} /> {notifications.length} NEW REPLIES
          </div>
        )}
      </div>

      {isExamWeek && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex items-center gap-4">
          <AlertTriangle className="text-red-600" size={32} />
          <p className="text-xs font-black text-red-800 uppercase tracking-widest leading-relaxed">
            CRITICAL: Weeks 12 & 24 are official examination windows.
            Submissions are monitored for academic integrity.
          </p>
        </div>
      )}

      {/* CHAT INTERFACE */}
      <div className="bg-gray-50 rounded-[3rem] h-[600px] flex flex-col border border-gray-200 overflow-hidden shadow-inner">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {othersSubmissions.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.userId === user.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-5 rounded-[2rem] ${
                  msg.userId === user.uid
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none"
                }`}
              >
                <p className="text-[9px] font-black uppercase mb-1 opacity-70">
                  {msg.userName}
                </p>
                <p className="font-bold text-sm leading-relaxed">
                  {msg.content}
                </p>

                <div className="mt-4 pt-3 border-t border-black/10">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-black/5 rounded-xl px-3 py-2 text-[10px] outline-none"
                      placeholder="Reply to peer..."
                      value={replyText[msg.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [msg.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleReplySubmit(msg)}
                      className="p-2 bg-black/10 rounded-xl hover:bg-black/20"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BOX */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="relative flex items-center gap-4">
            <textarea
              className="w-full p-6 bg-gray-100 rounded-[2rem] font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
              placeholder={
                isExamWeek
                  ? "Type your Exam Response here..."
                  : "Ask a question or share your findings..."
              }
              value={mySubmission}
              onChange={(e) => setMySubmission(e.target.value)}
              rows="2"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white p-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyForum;
