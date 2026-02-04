import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { 
  Users, BookOpen, Send, Mail, MessageSquare, PlusCircle, 
  LayoutGrid, CheckCircle, BarChart3, AlertTriangle, User, Clock 
} from 'lucide-react';
import React, { useState } from 'react';
import { BarChart3, Users, BookOpen } from 'lucide-react';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- NEW STATES FOR TRACKER ---
  const [studentStats, setStudentStats] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState('Web Development');

  // State for Course Upload
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'Computer Science',
    pdfUrl: ''
  });

  // Fetch Inquiries from Firebase
  useEffect(() => {
    const fetchInquiries = async () => {
      const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
    };
    fetchInquiries();
  }, []);

  // --- NEW EFFECT: Fetch Student Engagement Activity ---
  useEffect(() => {
    const fetchEngagementStats = async () => {
      try {
        // 1. Dauko Submissions
        const subQ = query(
          collection(db, "submissions"),
          where("weekId", "==", selectedWeek)
        );
        const subSnap = await getDocs(subQ);
        const submissions = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Dauko Replies
        const repQ = query(
          collection(db, "forum_replies"),
          where("weekId", "==", selectedWeek)
        );
        const repSnap = await getDocs(repQ);
        const allReplies = repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Tace bayanan kowane dalibi
        const stats = submissions.map(sub => {
          const studentReplies = allReplies.filter(r => r.userId === sub.userId);
          return {
            ...sub,
            replies: studentReplies,
            replyCount: studentReplies.length,
            isEligible: studentReplies.length >= 3
          };
        });
        setStudentStats(stats);
      } catch (err) {
        console.error("Tracker Error:", err);
      }
    };
  

    if (activeTab === 'activity') {
      fetchEngagementStats();
    }
  }, [activeTab, selectedWeek]);
const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    // Samun lokacin farkon yau (Midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "submissions"),
      where("createdAt", ">=", today)
    );

    // Sauraren database duk lokacin da aka tura sabo (Real-time)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodayCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);
  // Handle Course Upload
  const handleCourseUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        ...courseData,
        createdAt: serverTimestamp()
      });
      alert("Course uploaded successfully!");
      setCourseData({ title: '', description: '', videoUrl: '', category: 'Computer Science', pdfUrl: '' });
    } catch (error) {
      console.error(error);
      alert("Failed to upload course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 text-white hidden md:block shrink-0">
        <h2 className="text-xl font-black mb-10 tracking-tighter text-blue-400">AYAX ADMIN</h2>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === 'inquiries' ? 'bg-blue-600' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Users size={20} /> Inquiries
          </button>
          <button 
            onClick={() => setActiveTab('lms')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === 'lms' ? 'bg-blue-600' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <BookOpen size={20} /> Course Manager
          </button>
         {/* DIRECT LINK TARE DA NOTIFICATION BADGE */}
        <Link 
          to="/admin/activity" 
          className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all text-xs uppercase tracking-widest group"
        >
          <BarChart3 size={18} className="group-hover:text-blue-500 transition-colors" />
          <span>Student Activity</span>
          
          {todayCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-red-900/40">
              {todayCount}
            </span>
          )}
          <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      
                
          {/* NEW BUTTON FOR TRACKER */}
          <button 
            onClick={() => setActiveTab('activity')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === 'activity' ? 'bg-blue-600' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <BarChart3 size={20} /> Student Activity
          </button>
        </nav>
      </aside>
      

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 capitalize">
            {activeTab === 'activity' ? 'Engagement' : activeTab} Panel
          </h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm font-bold text-sm border border-gray-200">
            Status: <span className="text-green-500">Live</span>
          </div>
        </header>

        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 gap-6">
            {inquiries.length > 0 ? inquiries.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">{item.fullName}</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-black">{item.serviceTier}</span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-2"><Mail size={14}/> {item.email}</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-2xl italic text-sm mt-4 border border-dashed border-gray-200">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700">Reply Email</button>
                  <button className="px-6 py-2 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500">Delete</button>
                </div>
              </div>
            )) : <p className="text-gray-400 font-bold">No inquiries found yet.</p>}
          </div>
        )}

        {activeTab === 'lms' && (
          <div className="max-w-3xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <PlusCircle className="text-blue-600" /> Add New Global Lesson
            </h2>
            <form onSubmit={handleCourseUpload} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Lesson Title</label>
                  <input 
                    required 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={courseData.title}
                    onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                    placeholder="e.g. Intro to UI/UX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                    value={courseData.category}
                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                  >
                    <option>Computer Science</option>
                    <option>Business Admin</option>
                    <option>Digital Marketing</option>
                    <option>Cyber Security</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Video Link (YouTube/Vimeo)</label>
                <input 
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                  value={courseData.videoUrl}
                  onChange={(e) => setCourseData({...courseData, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Lesson Description</label>
                <textarea 
                  rows="4"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                  placeholder="Explain what students will learn..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {loading ? "Uploading to Global Server..." : "Publish Lesson"}
              </button>
            </form>
          </div>
        )}

        {/* --- NEW SECTION: STUDENT ACTIVITY TRACKER --- */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Week Filter Bar */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-gray-400">Select Week:</span>
              <div className="animate-in fade-in duration-500">
                <AdminStudentActivity courseId="full-stack-web" selectedWeek={selectedWeek} />
              </div>
              {[1, 2, 3, 4,].map(w => (
                <button 
                  key={w} 
                  onClick={() => setSelectedWeek(w)}
                  className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${selectedWeek === w ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Week {w}
                </button>
              ))}
            </div>

            {/* Stats List */}
            <div className="grid grid-cols-1 gap-4">
              {studentStats.length > 0 ? studentStats.map((stat) => (
                <div key={stat.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 font-black"><User size={18}/></div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{stat.userName}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Week {stat.weekId}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${stat.isEligible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.isEligible ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                      <span className="text-[10px] font-black uppercase">{stat.replyCount} / 3 Replies</span>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200">
                    <h5 className="text-[9px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1"><BookOpen size={10}/> Submission</h5>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{stat.content}"</p>
                  </div>

                  <div className="w-full md:w-1/4 space-y-2">
                    <h5 className="text-[9px] font-black uppercase text-gray-400 mb-2">Replies History</h5>
                    {stat.replies.map((r, i) => (
                      <div key={i} className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase">To: {r.replyToName}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1 italic">"{r.replyContent}"</p>
                      </div>
                    ))}
                    {stat.replies.length === 0 && <p className="text-[10px] font-bold text-gray-300 italic">No replies yet</p>}
                  </div>
                </div>
              )) : (
                <div className="bg-white py-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                  <MessageSquare size={40} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-gray-400 font-bold uppercase text-xs">No activity found for Week {selectedWeek}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;