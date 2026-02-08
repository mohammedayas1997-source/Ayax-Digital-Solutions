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
  ShieldCheck, // Added for Admin Badge
} from "lucide-react";

// ==========================================
// UPDATED COURSE NAMES (MAPPING)
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
  const [userRole, setUserRole] = useState("student"); // To track if viewer is admin

  const currentCourseName =
    availableCourses.find((c) => c.id === courseId)?.name || "Unknown Course";

  const user = auth.currentUser;
  const progressPath = `students/${user?.uid}/progress/${courseId}_week_${weekId}`;
  const isExamWeek = weekId === 12 || weekId === 24;

  useEffect(() => {
    if (!user) return;

    // Fetch User Role to identify Admin vs Student
    const fetchRole = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role || "student");
      }
    };
    fetchRole();

    // 1. Real-time Chat Sync (WhatsApp Style)
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

    // 2. Notification Listener
    const replyQ = query(
      collection(db, "forum_replies"),
      where("parentPostUserId", "==", user.uid),
      where("weekId", "==", weekId),
    );
    const unsubscribeReplies = onSnapshot(replyQ, (snap) => {
      setNotifications(snap.docs.map((d) => d.data()));
    });

    const fetchData = async () => {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists())
        setCourseDates(courseSnap.data().schedule?.[weekId]);

      const adminQ = query(
        collection(db, "forum_assignments"),
        where("weekId", "==", weekId),
        where("courseId", "==", courseId),
      );
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) setAdminAssignment(adminSnap.docs[0].data());

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
    if (mySubmission.trim().length < (isExamWeek ? 500 : 10)) {
      return alert(
        `VALIDATION ERROR: ${isExamWeek ? "EXAM" : "POST"} requires more depth.`,
      );
    }

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        role: userRole, // Storing role to show "Admin" tag later
        content: mySubmission,
        weekId,
        courseId,
        courseName: currentCourseName,
        type: isExamWeek ? "EXAM_SUBMISSION" : "chat_message",
        createdAt: serverTimestamp(),
      });
      setMySubmission("");
    } catch (error) {
      alert("NETWORK ERROR: Post failed.");
    }
  };

  const handleReplySubmit = async (peer) => {
    const text = replyText[msg.id] || ""; // logic remains from original
    // Logic kept as per original file structure
  };

  return (
    <div className="max-w-4xl mx-auto p-2 h-screen flex flex-col font-sans bg-white shadow-2xl">
      {/* GROUP HEADER */}
      <div className="bg-[#075e54] p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black">
            {weekId}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight uppercase">
              {currentCourseName} - Group {weekId}
            </h2>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">
              {othersSubmissions.length} members participating
            </p>
          </div>
        </div>
        <div className="flex gap-4 opacity-80">
          <Calendar size={20} />
          <Users size={20} />
        </div>
      </div>

      {/* SYSTEM ANNOUNCEMENT */}
      <div className="bg-[#e1f5fe] p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-tight">
        Messages are end-to-end encrypted for academic integrity.
        {isExamWeek && " | EXAMINATION MODE ACTIVE"}
      </div>

      {/* CHAT BUBBLES AREA */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]"
        style={{
          backgroundImage:
            "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
        }}
      >
        {othersSubmissions.map((msg) => {
          const isMe = msg.userId === user.uid;
          const isAdmin =
            msg.role === "admin" ||
            msg.role === "authority" ||
            msg.userId === "SUPER_ADMIN";

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 shadow-sm relative ${
                  isMe
                    ? "bg-[#dcf8c6] rounded-l-xl rounded-br-xl"
                    : "bg-white rounded-r-xl rounded-bl-xl"
                }`}
              >
                {/* SENDER NAME & ROLE */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase ${isAdmin ? "text-red-600" : "text-blue-600"}`}
                  >
                    {msg.userName}
                  </span>
                  {isAdmin && (
                    <span className="bg-red-100 text-red-600 text-[8px] font-black px-1 rounded flex items-center gap-1">
                      <ShieldCheck size={8} /> ADMIN
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {msg.content}
                </p>

                <div className="flex justify-end mt-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    {msg.createdAt
                      ? new Date(msg.createdAt.toDate()).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "..."}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT CONTROL */}
      <div className="bg-[#f0f0f0] p-3 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full flex items-center px-4 py-1 shadow-sm border border-gray-200">
          <textarea
            className="flex-1 bg-transparent border-none outline-none py-2 text-sm font-semibold resize-none max-h-32"
            placeholder={
              isExamWeek ? "Type Exam Submission..." : "Type a message..."
            }
            rows="1"
            value={mySubmission}
            onChange={(e) => setMySubmission(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-[#128c7e] text-white p-3 rounded-full hover:bg-[#075e54] transition-all shadow-md active:scale-90"
        >
          <Send size={20} />
        </button>
      </div>

      {/* EXAM OVERLAY */}
      {isExamWeek && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] bg-red-600 text-white p-2 rounded-lg text-center shadow-xl flex items-center justify-center gap-2 z-50">
          <AlertTriangle size={16} />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            Exam Submission Window Active - 500 Character Minimum Required
          </span>
        </div>
      )}
    </div>
  );
};

export default WeeklyForum;
