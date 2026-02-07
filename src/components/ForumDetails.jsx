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

  // 1. Fetch Main Thread Data
  useEffect(() => {
    const fetchThread = async () => {
      const docRef = doc(db, "forum_threads", threadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setThread(docSnap.data());
      } else {
        navigate("/portal"); // Redirect if thread doesn't exist
      }
      setLoading(false);
    };
    fetchThread();
  }, [threadId, navigate]);

  // 2. Sync Replies in Real-Time
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

    try {
      await addDoc(collection(db, "forum_threads", threadId, "replies"), {
        content: newReply,
        authorName: auth.currentUser.displayName || "Student",
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        isInstructor: false, // You can toggle this based on user roles
      });
      setNewReply("");
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  if (loading)
    return <div className="p-20 text-center font-black">LOADING THREAD...</div>;

  return (
    <div
      className={`min-h-screen p-6 lg:p-14 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} /> Back to Forum
        </button>

        {/* Original Post */}
        <div
          className={`p-10 rounded-[3rem] border mb-10 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
              {thread.studentName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                {thread.title}
              </h1>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-black text-blue-500 uppercase">
                  {thread.studentName}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  • {thread.studentType}
                </span>
              </div>
            </div>
          </div>
          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
            {thread.content}
          </p>
        </div>

        {/* Replies Section */}
        <div className="space-y-6 mb-12">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 px-4">
            Discussion ({replies.length})
          </h3>

          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-8 rounded-[2.5rem] border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-50"} ml-6 lg:ml-12`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-black">
                  {reply.authorName?.charAt(0)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {reply.authorName}
                </span>
                {reply.isInstructor && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-md uppercase">
                    Instructor
                  </span>
                )}
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                {reply.content}
              </p>
            </div>
          ))}
        </div>

        {/* Reply Input */}
        <div
          className={`sticky bottom-10 p-4 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200 shadow-2xl"}`}
        >
          <form onSubmit={handleReply} className="flex items-center gap-4">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a technical response..."
              className={`flex-1 p-5 rounded-2xl font-bold text-sm outline-none transition-all ${darkMode ? "bg-slate-800 focus:bg-slate-700" : "bg-gray-50 focus:bg-white"}`}
            />
            <button className="p-5 bg-blue-600 text-white rounded-2xl hover:scale-105 transition-transform">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumDetails;
