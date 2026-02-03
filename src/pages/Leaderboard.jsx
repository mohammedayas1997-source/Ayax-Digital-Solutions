import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Medal, Star, Target } from 'lucide-react';

const Leaderboard = ({ courseId }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Idan babu courseId, kada mu nemi komai
      if (!courseId) return;

      try {
        // 1. Dauko dukkan submissions na wannan course din da aka riga aka ba maki
        const q = query(
          collection(db, "submissions"),
          where("courseId", "==", courseId),
          where("graded", "==", true)
        );

        const querySnapshot = await getDocs(q);
        const allGrades = querySnapshot.docs.map(doc => doc.data());

        // 2. Lissafa average score na kowane dalibi
        const studentScores = {};
        allGrades.forEach(sub => {
          // Tabbatar muna da userName da grade kafin lissafi
          const name = sub.userName || "Anonymous Student";
          const grade = sub.grade || 0;

          if (!studentScores[name]) {
            studentScores[name] = { total: 0, count: 0 };
          }
          studentScores[name].total += grade;
          studentScores[name].count += 1;
        });

        // 3. Mayar da su array sannan a yi musu ranking
        const ranked = Object.keys(studentScores).map(name => ({
          name,
          average: (studentScores[name].total / studentScores[name].count).toFixed(1)
        }))
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average)) // Tabbatar muna kwatanta numbers
        .slice(0, 10); 

        setTopStudents(ranked);
      } catch (error) {
        console.error("🔥 Leaderboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [courseId]);

  if (loading) return (
    <div className="p-20 text-center animate-pulse">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trophy className="text-blue-600 animate-bounce" size={24} />
      </div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Computing Global Rankings...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
      <header className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
          <Trophy size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Top Performers</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Global Rankings for {courseId?.replace(/-/g, ' ')}</p>
        </div>
      </header>

      <div className="space-y-4">
        {topStudents.length === 0 ? (
          <div className="text-center py-10">
            <Target className="mx-auto text-gray-200 mb-2" size={40} />
            <p className="text-gray-400 font-bold">No rankings available yet for this course.</p>
          </div>
        ) : (
          topStudents.map((student, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all hover:scale-[1.01] ${
                index === 0 ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-gray-50 border-transparent text-gray-800'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-black uppercase tracking-tight ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                    {student.name}
                  </p>
                  {index === 0 && <p className="text-[8px] font-black uppercase tracking-widest opacity-70">University Champion</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-xl font-black ${index === 0 ? 'text-white' : 'text-blue-600'}`}>{student.average}%</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${index === 0 ? 'text-blue-200' : 'text-gray-400'}`}>Average</p>
                </div>
                {index < 3 && <Medal size={20} className={index === 0 ? 'text-yellow-300' : 'text-gray-400'} />}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-10 p-6 bg-gray-900 rounded-[2rem] flex items-center gap-4">
          <div className="text-yellow-500"><Star size={20} fill="currentColor" /></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            Rankings are updated automatically based on assignment performance and exam scores.
          </p>
      </div>
    </div>
  );
};

export default Leaderboard;