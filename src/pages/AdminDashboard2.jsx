import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Users, BookOpen, Mail, PlusCircle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for Course Upload
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'Computer Science',
    pdfUrl: ''
  });

  // Fetch Inquiries from Firebase
  const fetchInquiries = async () => {
    try {
      const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
    } catch (err) {
      console.error("🔥 Inquiry Fetch Error:", err);
      // Fallback idan index bai riga ya kammala ba
      const querySnapshot = await getDocs(collection(db, "inquiries"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Handle Delete Inquiry
  const handleDeleteInquiry = async (id) => {
    if (window.confirm("Shin kana da tabbacin kana son goge wannan sako?")) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
        setInquiries(inquiries.filter(item => item.id !== id));
        alert("An goge sako cikin nasara.");
      } catch (error) {
        alert("An samu matsala wajen goge sako.");
      }
    }
  };

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
      <aside className="w-64 bg-gray-900 p-6 text-white hidden md:block">
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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 capitalize">{activeTab} Panel</h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm font-bold text-sm border border-gray-200">
            Status: <span className="text-green-500">Live</span>
          </div>
        </header>

        {activeTab === 'inquiries' ? (
          <div className="grid grid-cols-1 gap-6">
            {inquiries.length > 0 ? inquiries.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">{item.fullName || "No Name"}</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-black uppercase tracking-widest">{item.serviceTier}</span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-2"><Mail size={14}/> {item.email}</p>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                    <p className="text-gray-700 italic text-sm leading-relaxed">
                      "{item.message}"
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                  <a href={`mailto:${item.email}`} className="text-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors">Reply Email</a>
                  <button 
                    onClick={() => handleDeleteInquiry(item.id)}
                    className="px-6 py-3 border border-gray-200 text-gray-400 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-400 font-bold p-10 bg-white rounded-3xl text-center border-2 border-dashed">No inquiries found yet.</p>}
          </div>
        ) : (
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
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold appearance-none"
                    value={courseData.category}
                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                  >
                    <option>Computer Science</option>
                    <option>Business Admin</option>
                    <option>Digital Marketing</option>
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
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold resize-none"
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                  placeholder="Explain what students will learn..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50 transition-all transform active:scale-95"
              >
                {loading ? "Uploading to Global Server..." : "Publish Lesson"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;