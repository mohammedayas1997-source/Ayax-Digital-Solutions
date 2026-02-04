import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { User, MessageCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminStudentActivity = ({ courseId, selectedWeek = 1 }) => {
  const [studentStats, setStudentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        // 1. Dauko dukkan 'submissions' (Main Assignments)
        const subQ = query(
          collection(db, "submissions"),
          where("courseId", "==", courseId),
          where("weekId", "==", selectedWeek)
        );
        const subSnap = await getDocs(subQ);
        const submissions = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Dauko dukkan 'forum_replies'
        const repQ = query(
          collection(db, "forum_replies"),
          where("courseId", "==", courseId),
          where("weekId", "==", selectedWeek)
        );
        const repSnap = await getDocs(repQ);
        const allReplies = repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Hada bayanan don kowane dalibi
        const activityMap = submissions.map(sub => {
          const studentReplies = allReplies.filter(r => r.userId === sub.userId);
          return {
            ...sub,
            replies: studentReplies,
            replyCount: studentReplies.length,
            isEligible: studentReplies.length >= 3
          };
        });

        setStudentStats(activityMap);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
      setLoading(false);
    };

    fetchActivityData();
  }, [courseId, selectedWeek]);

  if (loading) return <div className="p-10 text-center font-black animate-pulse">LOADING ANALYTICS...</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Engagement Tracker</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Monitoring Week {selectedWeek} Academic Compliance</p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black text-blue-600 uppercase">Total Submissions</span>
            <span className="text-4xl font-black">{studentStats.length}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {studentStats.map((student) => (
            <div key={student.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                
                {/* Profile & Status */}
                <div className="md:w-1/4 space-y-4 border-r border-gray-50 pr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-none">{student.userName}</h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">ID: {student.userId.substring(0,8)}</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl flex items-center gap-3 ${student.isEligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {student.isEligible ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    <span className="text-xs font-black uppercase tracking-widest">
                      {student.replyCount}/3 Replies
                    </span>
                  </div>
                </div>

                {/* Assignment Content */}
                <div className="md:w-2/4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={12}/> Main Assignment Content
                  </h4>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 italic text-sm text-gray-700 leading-relaxed">
                    "{student.content}"
                  </div>
                </div>

                {/* Detailed Replies Tracker */}
                <div className="md:w-1/4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Review History</h4>
                  <div className="space-y-2">
                    {student.replies.length > 0 ? student.replies.map((rep, idx) => (
                      <div key={idx} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase">To: {rep.replyToName}</p>
                        <p className="text-[10px] text-gray-600 line-clamp-1">"{rep.replyContent}"</p>
                      </div>
                    )) : (
                      <p className="text-[10px] font-bold text-gray-300 italic">No replies recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentActivity;