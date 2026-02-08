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
} from "firebase/firestore";
import {
  MessageSquare,
  CheckCircle,
  Users,
  Pin,
  Send,
  Reply,
} from "lucide-react";

// ==========================================
// OFFICIAL COURSE CURRICULUM LIST
// ==========================================
const VALID_COURSES = [
  "Cyber security",
  "Data Analytics",
  "Software Engineering",
  "Artificial Intelligence",
  "Blockchain Technology",
  "Web development",
  "advanced Digital Marketing",
];

const WeeklyForum = ({ weekId, courseId }) => {
  const [mySubmission, setMySubmission] = useState("");
  const [othersSubmissions, setOthersSubmissions] = useState([]);
  const [repliesCount, setRepliesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [adminAssignment, setAdminAssignment] = useState(null);
  const [replyText, setReplyText] = useState({});

  const user = auth.currentUser;
  const progressPath = `students/${user?.uid}/progress/${courseId}_week_${weekId}`;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Check Student Completion Status
      const progRef = doc(db, progressPath);
      const progSnap = await getDoc(progRef);
      if (progSnap.exists() && progSnap.data().status === "completed") {
        setIsCompleted(true);
      }

      // 2. Fetch Sticky Assignment from Administrative Records
      const adminQ = query(
        collection(db, "forum_assignments"),
        where("weekId", "==", weekId),
        where("courseId", "==", courseId),
      );
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) {
        setAdminAssignment(adminSnap.docs[0].data());
      }

      // 3. Sync Peer Contributions
      fetchPeerWork();

      // 4. Validate and Count User Interaction
      const repliesQ = query(
        collection(db, "forum_replies"),
        where("userId", "==", user.uid),
        where("weekId", "==", weekId),
      );
      const repliesSnap = await getDocs(repliesQ);
      setRepliesCount(repliesSnap.size);

      // Verify if the student already has a main submission
      const subQ = query(
        collection(db, "submissions"),
        where("userId", "==", user.uid),
        where("weekId", "==", weekId),
      );
      const subSnap = await getDocs(subQ);
      if (!subSnap.empty) setHasSubmitted(true);

      if (repliesSnap.size >= 3 && !subSnap.empty) markAsComplete();
    };

    fetchData();
  }, [weekId, courseId, user, hasSubmitted]);

  const fetchPeerWork = async () => {
    try {
      const q = query(
        collection(db, "submissions"),
        where("weekId", "==", weekId),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      const filtered = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.userId !== user?.uid);
      setOthersSubmissions(filtered);
    } catch (error) {
      console.error("Infrastructure Error: Unable to fetch peer data", error);
    }
  };

  const handleSubmit = async () => {
    if (mySubmission.trim().length < 100) {
      return alert(
        "Input Validation Failed: Your response must be at least 100 characters to ensure academic quality.",
      );
    }

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        content: mySubmission,
        weekId,
        courseId, // Wannan zai dauki daya daga cikin jerin: Cyber security, Data Analytics, da sauransu
        type: "main_assignment",
        createdAt: serverTimestamp(),
      });
      setHasSubmitted(true);
      alert(
        "Submission Successful: You must now engage with 3 peer contributions to unlock the next module.",
      );
    } catch (error) {
      alert("Network Error: Submission could not be processed.");
    }
  };

  const handleReplySubmit = async (peer) => {
    const text = replyText[peer.id];
    if (!text || text.trim().length < 10) {
      return alert(
        "Interaction Refused: Please provide meaningful scholarly feedback (min 10 characters).",
      );
    }

    try {
      await addDoc(collection(db, "forum_replies"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        replyContent: text,
        parentPostId: peer.id,
        parentPostContent: peer.content,
        replyToName: peer.userName,
        weekId,
        courseId,
        createdAt: serverTimestamp(),
      });

      setReplyText((prev) => ({ ...prev, [peer.id]: "" }));
      const newCount = repliesCount + 1;
      setRepliesCount(newCount);

      alert("Scholarly Reply Logged.");
      if (newCount >= 3 && hasSubmitted) markAsComplete();
    } catch (error) {
      alert("Synchronisation Error: Reply failed to register.");
    }
  };

  const markAsComplete = async () => {
    const progRef = doc(db, progressPath);
    await setDoc(
      progRef,
      {
        status: "completed",
        completedAt: serverTimestamp(),
        courseId,
        weekId,
      },
      { merge: true },
    );
    setIsCompleted(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Administrative Instruction Header */}
      {adminAssignment && (
        <div className="sticky top-4 z-40 bg-blue-700 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-b-8 border-yellow-400 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Pin className="rotate-45 text-yellow-300" size={24} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px] text-blue-100">
              Official Assignment Protocol
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black leading-tight italic">
            "{adminAssignment.instruction}"
          </h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${repliesCount >= 3 ? "bg-green-400" : "bg-red-400 animate-pulse"}`}
              ></div>
              <span className="text-[10px] font-black uppercase">
                Engagement: {repliesCount} / 3 Peer Replies
              </span>
            </div>
          </div>
        </div>
      )}

      {isCompleted ? (
        <div className="bg-emerald-500 p-12 rounded-[3.5rem] text-center text-white shadow-2xl">
          <CheckCircle size={80} className="mx-auto mb-6" />
          <h3 className="text-4xl font-black">Curriculum Requirement Met</h3>
          <p className="mt-4 font-bold opacity-90">
            Your contributions have been verified. Module access granted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">
                  Primary Submission Interface
                </h4>
                {hasSubmitted && (
                  <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-[10px] font-black italic">
                    ✓ AUTHENTICATED
                  </span>
                )}
              </div>
              <textarea
                className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all h-64 font-bold text-gray-700 resize-none"
                placeholder="Transcribe your findings here based on the Administrative Instruction..."
                value={mySubmission}
                onChange={(e) => setMySubmission(e.target.value)}
                disabled={hasSubmitted}
              />
              {!hasSubmitted && (
                <button
                  onClick={handleSubmit}
                  className="mt-6 w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl active:scale-95 transition-all"
                >
                  Commit to Public Record
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[800px] pr-2">
            <h4 className="font-black text-gray-400 uppercase text-[10px] tracking-widest px-4">
              Academic Discussion Feed
            </h4>

            {othersSubmissions.map((peer) => (
              <div
                key={peer.id}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                    {peer.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-900">
                      {peer.userName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      Peer Contributor
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 italic">
                  "{peer.content}"
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      className="w-full p-4 bg-gray-100 rounded-2xl text-xs font-bold focus:bg-white border-2 border-transparent focus:border-blue-200 outline-none transition-all resize-none"
                      placeholder="Submit peer feedback..."
                      value={replyText[peer.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [peer.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleReplySubmit(peer)}
                      className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyForum;
