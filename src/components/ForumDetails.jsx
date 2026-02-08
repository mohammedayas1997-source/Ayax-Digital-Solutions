import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const ForumDetails = ({ darkMode }) => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");

  // 1. Fetch Thread and User Authority Role
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch Thread
      const docRef = doc(db, "forum_threads", threadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setThread(docSnap.data());
      } else {
        navigate("/portal");
      }

      // Fetch Current User Role
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role || "student");
        }
      }
      setLoading(false);
    };
    fetchInitialData();
  }, [threadId, navigate]);

  // 2. Sync Replies in Real-Time (WhatsApp Group Style)
  useEffect(() => {
    const q = query(
      collection(db, "forum_threads", threadId, "replies"),
      orderBy("createdAt", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReplies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [threadId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const isAdmin =
      userRole === "admin" ||
      userRole === "authority" ||
      userRole === "instructor";

    try {
      await addDoc(collection(db, "forum_threads", threadId, "replies"), {
        content: newReply,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        isInstructor: isAdmin,
        role: userRole,
      });
      setNewReply("");
    } catch (error) {
      console.error("COMMUNICATION_ERROR: Thread injection failed.", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-black tracking-widest animate-pulse">
        SYNCHRONIZING THREAD...
      </div>
    );

  return (
    <div
      className={`min-h-screen flex flex-col ${darkMode ? "bg-slate-950 text-white" : "bg-[#e5ddd5] text-slate-900"}`}
    >
      {/* Thread Header (WhatsApp Group Bar Style) */}
      <div
        className={`sticky top-0 z-50 p-4 border-b flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-[#075e54] text-white"}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight truncate max-w-[200px] lg:max-w-md">
              {thread.title}
            </h1>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
              Topic by {thread.studentName}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <MessageSquare size={20} className="opacity-60" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 lg:p-8 space-y-6">
        {/* The Original Root Post */}
        <div
          className={`p-8 rounded-[2rem] border-2 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-blue-100"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Initial Discussion Point
            </span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          <p className="text-xl font-bold leading-relaxed opacity-90">
            {thread.content}
          </p>
          <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
            <Clock size={12} />{" "}
            {thread.createdAt?.toDate().toLocaleString() || "Syncing time..."}
          </div>
        </div>

        {/* Message Bubbles Area */}
        <div className="space-y-4">
          {replies.map((reply) => {
            const isMe = reply.authorId === auth.currentUser.uid;
            const isAdmin = reply.isInstructor || reply.role === "admin";

            return (
              <div
                key={reply.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-5 rounded-[1.8rem] shadow-sm relative ${
                    isMe
                      ? darkMode
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-[#dcf8c6] text-gray-800 rounded-tr-none"
                      : darkMode
                        ? "bg-slate-800 text-white rounded-tl-none"
                        : "bg-white text-gray-800 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-black uppercase ${isAdmin ? "text-red-500" : isMe ? "text-green-700" : "text-blue-600"}`}
                    >
                      {reply.authorName}
                    </span>
                    {isAdmin && (
                      <span className="bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck size={8} /> AUTHORITY
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">
                    {reply.content}
                  </p>
                  <div className="flex justify-end mt-1 opacity-40">
                    <span className="text-[8px] font-black">
                      {reply.createdAt
                        ?.toDate()
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Reply Bar */}
      <div
        className={`sticky bottom-0 p-4 border-t ${darkMode ? "bg-slate-900 border-slate-800" : "bg-[#f0f0f0] border-gray-200"}`}
      >
        <form
          onSubmit={handleReply}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Inject technical insight..."
              className={`w-full p-4 pl-6 rounded-full font-bold text-sm outline-none shadow-inner ${darkMode ? "bg-slate-800 focus:bg-slate-700 text-white" : "bg-white focus:ring-2 focus:ring-[#075e54]"}`}
            />
          </div>
          <button className="p-4 bg-[#128c7e] text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForumDetails;
