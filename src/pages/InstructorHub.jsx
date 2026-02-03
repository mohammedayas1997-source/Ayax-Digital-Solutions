import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { 
  collection, onSnapshot, addDoc, serverTimestamp, 
  query, where, orderBy, doc, getDoc, updateDoc 
} from 'firebase/firestore';
import { 
  UploadCloud, FileText, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Send, LayoutDashboard,
  Users, BookOpen, ShieldCheck
} from 'lucide-react';

const InstructorHub = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', course: '', deadline: '', points: '' });
  const [loading, setLoading] = useState(false);

  // Sync Assignments
  useEffect(() => {
    // Idan Admin ne, zai ga kowane assignment. Idan Malami ne, na kwas dinsa kawai.
    const q = isAdmin 
      ? query(collection(db, "assignments"), orderBy("createdAt", "desc"))
      : query(collection(db, "assignments"), where("instructorId", "==", auth.currentUser.uid));

    const unsub = onSnapshot(q, (snap) => {
      setAssignments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [isAdmin]);

  const handlePostAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...newAssignment,
        instructorId: auth.currentUser.uid,
        instructorName: auth.currentUser.displayName || "Instructor",
        createdAt: serverTimestamp(),
        status: 'active'
      });
      alert("ACADEMIC_LOG: Assignment Published Successfully.");
      setNewAssignment({ title: '', course: '', deadline: '', points: '' });
    } catch (err) {
      alert("SYSTEM_ERROR: Could not publish assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-8 md:p-12 font-sans">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            {isAdmin ? "Global Academic Oversight" : "Instructor Command Hub"}
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
            Status: {isAdmin ? "Full Authority Mode" : "Instructional Access"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT: Assignment Creator (Ga Malamai Kadai, amma Admin na iya gani) */}
        {!isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2">
                <UploadCloud className="text-blue-600"/> New Tasking
              </h3>
              <form onSubmit={handlePostAssignment} className="space-y-4">
                <input required className="hub-input" placeholder="ASSIGNMENT TITLE" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}/>
                <select required className="hub-input" value={newAssignment.course} onChange={e => setNewAssignment({...newAssignment, course: e.target.value})}>
                  <option value="">SELECT COURSE</option>
                  <option value="Web Development">WEB DEVELOPMENT</option>
                  <option value="Cyber Security">CYBER SECURITY</option>
                  <option value="Data Science">DATA SCIENCE</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" className="hub-input" value={newAssignment.deadline} onChange={e => setNewAssignment({...newAssignment, deadline: e.target.value})}/>
                  <input required type="number" className="hub-input" placeholder="POINTS" value={newAssignment.points} onChange={e => setNewAssignment({...newAssignment, points: e.target.value})}/>
                </div>
                <button disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                  {loading ? "PROVISIONING..." : "DISPATCH ASSIGNMENT"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RIGHT: Assignment Monitoring Feed */}
        <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Academic Feed</h3>
          {assignments.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FileText size={24}/>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{task.title}</h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{task.course}</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-100">
                  Due: {task.deadline}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                    <Users size={14}/> 0 Submissions
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                    <CheckCircle size={14}/> {task.points} Points
                  </div>
                </div>
                {isAdmin && (
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">Instructor: {task.instructorName}</p>
                )}
                <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                  Review Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hub-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-weight: 700; font-size: 0.8rem; outline: none; transition: 0.3s; }
        .hub-input:focus { border-color: #2563eb; background: white; }
      `}</style>
    </div>
  );
};

export default InstructorHub;