import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Na kara wannan
import { Award, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';

const StudentGrades = ({ courseId }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Sanya user a state

  // 1. Tabbatar da login state kafin komai
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!currentUser || !courseId) return;
      
      try {
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", currentUser.uid),
          where("courseId", "==", courseId),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedGrades = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGrades(fetchedGrades);
      } catch (error) {
        console.error("🔥 Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchGrades();
    }
  }, [currentUser, courseId]);

  // Calculate Average Score
  const gradedSubmissions = grades.filter(g => g.graded);
  const average = gradedSubmissions.length > 0 
    ? (gradedSubmissions.reduce((acc, curr) => acc + curr.grade, 0) / gradedSubmissions.length).toFixed(1)
    : 0;

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="p-10 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase text-xs">
        Fetching Academic Records...
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Academic Progress</h2>
          <p className="text-gray-400 font-bold text-sm mt-2 tracking-widest uppercase italic">Your performance in {courseId?.replace(/-/g, ' ')}</p>
        </div>
        
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Overall Average</p>
            <p className="text-3xl font-black">{average}%</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {grades.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
            <FileText className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold">No assignments submitted yet.</p>
          </div>
        ) : (
          grades.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black ${item.graded ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.graded ? <Award size={32} /> : <Clock size={32} />}
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Week {item.weekId} Assignment</h4>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Submitted: {item.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${item.graded ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.graded ? 'Graded' : 'Pending Review'}
                  </span>
                </div>

                <div className="w-24 h-24 bg-gray-900 rounded-3xl flex flex-col items-center justify-center text-white">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">Score</p>
                  <p className="text-3xl font-black">{item.graded ? `${item.grade}%` : '--'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentGrades;