import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { CheckCircle, Clock, User, ArrowLeft, FileText, AlertCircle } from 'lucide-react';

const AdminGrading = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeInput, setGradeInput] = useState({});
  const [updatingId, setUpdatingId] = useState(null); // Don nuna loading a jikin button

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "submissions"),
          where("courseId", "==", courseId)
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Tabbatar akwai date ko da babu createdAt
          createdAt: doc.data().createdAt?.toDate() || new Date(0) 
        }));
        
        // Sorting a local don gujewa bukatar Firebase Index
        setSubmissions(data.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("🔥 Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchSubmissions();
  }, [courseId]);

  const handleGrade = async (subId) => {
    const grade = gradeInput[subId];
    
    if (grade === undefined || grade === "" || grade < 0 || grade > 100) {
      return alert("Kuskure: Shigar da maki tsakanin 0 zuwa 100.");
    }

    setUpdatingId(subId);
    try {
      const subRef = doc(db, "submissions", subId);
      const finalGrade = Number(grade);
      
      await updateDoc(subRef, { 
        grade: finalGrade, 
        graded: true,
        gradedAt: new Date(),
        status: finalGrade >= 50 ? "passed" : "failed"
      });
      
      // Update local state don gudun sake kiran database
      setSubmissions(prev => prev.map(s => 
        s.id === subId ? { ...s, grade: finalGrade, graded: true } : s
      ));
      
      alert("Maki ya hau daram!");
    } catch (error) {
      console.error("🔥 Grading Error:", error);
      alert("An samu matsala wurin tura makin.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInputChange = (subId, value) => {
    setGradeInput({ ...gradeInput, [subId]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-black mb-8 transition-all uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Grading Center</h1>
            <p className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
              Course: {courseId?.replace(/-/g, ' ')}
            </p>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</p>
              <p className="text-2xl font-black text-orange-500">
                {submissions.filter(s => !s.graded).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <Clock size={24} />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-40">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-gray-300 uppercase text-[10px] tracking-[0.4em]">Synchronizing...</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {submissions.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                <FileText size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="font-black text-gray-400 uppercase text-xs tracking-widest">No submissions found for this course.</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-2 rounded-[3.2rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-2 transition-all hover:shadow-2xl">
                  
                  <div className="flex-grow p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${sub.graded ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {sub.weekId ? `Week ${sub.weekId}` : 'Final Project'}
                      </span>
                      <div className="flex items-center gap-2 text-gray-900 font-black text-xs uppercase tracking-tight">
                        <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                            <User size={14} />
                        </div>
                        {sub.userName || "Anonymous Student"}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-50/50">
                        <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {sub.content}
                        </p>
                    </div>
                  </div>

                  <div className={`w-full lg:w-80 p-10 rounded-[3rem] flex flex-col justify-center transition-all duration-500 ${sub.graded ? 'bg-green-600' : 'bg-gray-900'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Grade Assignment</p>
                    
                    {sub.graded ? (
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-6xl font-black tracking-tighter">{sub.grade}%</p>
                        <p className="text-[10px] font-black uppercase mt-3 tracking-widest opacity-60">Verified & Locked</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="00"
                                value={gradeInput[sub.id] || ''}
                                onChange={(e) => handleInputChange(sub.id, e.target.value)}
                                className="w-full bg-white/10 border-2 border-white/5 rounded-2xl p-6 text-center text-4xl font-black text-white outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-xl">%</span>
                        </div>
                        <button 
                          disabled={updatingId === sub.id}
                          onClick={() => handleGrade(sub.id)}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                        >
                          {updatingId === sub.id ? "Processing..." : "Commit Grade"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGrading;