import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, CheckCircle, Users } from 'lucide-react';

const WeeklyForum = ({ weekId, courseId }) => {
  const [mySubmission, setMySubmission] = useState("");
  const [othersSubmissions, setOthersSubmissions] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const user = auth.currentUser;

  // Path na progress domin rage maimaita code
  const progressPath = `students/${user?.uid}/progress/${courseId}_week_${weekId}`;

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      const progRef = doc(db, progressPath);
      const progSnap = await getDoc(progRef);
      if (progSnap.exists() && progSnap.data().status === 'completed') {
        setIsCompleted(true);
      }
    };

    checkStatus();
    fetchPeerWork();
  }, [weekId, courseId, user]);

  const fetchPeerWork = async () => {
    try {
      const q = query(collection(db, "submissions"), where("weekId", "==", weekId));
      const snap = await getDocs(q);
      const filtered = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId !== user?.uid);
      
      // Dauko guda 3 kawai don yin review
      setOthersSubmissions(filtered.slice(0, 3));
    } catch (error) {
      console.error("Error fetching peers:", error);
    }
  };

  const handleSubmit = async () => {
    // Tabbatar da tsawon sako (Academic Standard)
    if (mySubmission.trim().length < 100) {
      return alert("Your response is too short. Please provide at least 100 characters.");
    }

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        userName: user.email,
        content: mySubmission,
        weekId,
        courseId,
        createdAt: serverTimestamp()
      });
      setHasSubmitted(true);
      alert("Assignment posted! Now review 3 peers to complete this week.");
    } catch (error) {
      alert("Submission failed. Please try again.");
    }
  };

  const handleReview = () => {
    setCommentCount(prev => {
      const updated = prev + 1;
      if (updated >= 3) markAsComplete();
      return updated;
    });
  };

  const markAsComplete = async () => {
    const progRef = doc(db, progressPath);
    try {
      // Amfani da setDoc tare da {merge: true} ya fi tsaro idan document din bai riga ya wanzu ba
      await setDoc(progRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        courseId,
        weekId
      }, { merge: true });
      
      setIsCompleted(true);
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <MessageSquare className="text-blue-600" size={28} />
          </div> 
          Week {weekId} Academic Forum
        </h2>
        <p className="text-gray-500 mt-3 font-medium text-sm md:text-base leading-relaxed">
          Share your research findings and engage in peer-to-peer scholarly review to unlock your weekly completion badge.
        </p>
      </div>

      {isCompleted ? (
        <div className="bg-blue-600 p-10 md:p-16 rounded-[3rem] text-center text-white shadow-2xl shadow-blue-200 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter">Module Completed!</h3>
          <p className="mt-4 font-bold text-blue-100 max-w-md mx-auto opacity-90">
            Great job! You have fulfilled the discussion requirements for this week.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-full">Your Submission</h4>
                {hasSubmitted && <span className="text-green-500 font-black text-[10px] uppercase">✓ Posted</span>}
              </div>
              
              <textarea 
                className={`w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-0 font-bold text-gray-700 h-80 transition-all resize-none ${hasSubmitted ? 'opacity-50' : ''}`}
                placeholder="Structure your findings here (Minimum 100 characters)..."
                value={mySubmission}
                onChange={(e) => setMySubmission(e.target.value)}
                disabled={hasSubmitted}
              />
              
              {!hasSubmitted && (
                <button 
                  onClick={handleSubmit} 
                  className="mt-6 w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
                >
                  Publish to Forum
                </button>
              )}
            </div>
          </div>

          {/* Peer Review Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} className="text-blue-400"/> Peer Review
                </h4>
                <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{commentCount}/3</span>
              </div>

              <div className="space-y-4">
                {othersSubmissions.length > 0 ? othersSubmissions.map(peer => (
                  <div key={peer.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-tighter italic">Anonymous Scholar:</p>
                    <p className="text-xs line-clamp-3 text-gray-400 mb-4 leading-relaxed">"{peer.content}"</p>
                    <button 
                      onClick={handleReview} 
                      className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Review & Approve
                    </button>
                  </div>
                )) : (
                  <div className="py-10 text-center opacity-30">
                    <Users size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-bold uppercase">Waiting for peers...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Locked Status info */}
            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight">
                 Requirement: Submit your work and review 3 peers to unlock the next module.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyForum;