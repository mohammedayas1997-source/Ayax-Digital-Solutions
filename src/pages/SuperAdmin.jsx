import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, onSnapshot, updateDoc, doc, 
  addDoc, serverTimestamp, deleteDoc, query, orderBy, where 
} from 'firebase/firestore';

import { 
  Users, BookOpen, CreditCard, LayoutDashboard, 
  CheckCircle, Trash2, Award, Globe, UserPlus, Eye, 
  Phone, MessageSquare, Send, Loader2, ShieldCheck, 
  XCircle, Activity, ShieldAlert, Search, Video, FileText, ClipboardList
} from 'lucide-react';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(false);

  // New Academic State for Super Admin
  const [lessons, setLessons] = useState([]);
  const [academicData, setAcademicData] = useState({
    type: 'video', // video, assignment, or exam
    title: '',
    content: '', // URL for video or description for others
    week: '1',
    course: 'Web Development'
  });

  const availableCourses = ["Web Development", "Graphic Design", "Digital Marketing", "Cyber Security"];

  // New User Form State
  const [userData, setUserData] = useState({
    name: '', email: '', phone: '', password: '', role: 'student', comment: ''
  });

  // REAL-TIME DATA ENGINE
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "course_applications"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setSystemUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubServices = onSnapshot(collection(db, "service_requests"), (snap) => {
      setServiceRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qForum = query(collection(db, "forum_threads"), orderBy("createdAt", "desc"));
    const unsubForum = onSnapshot(qForum, (snap) => {
      setAllThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLessons = onSnapshot(query(collection(db, "lessons"), orderBy("createdAt", "desc")), (snap) => {
      setLessons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStudents(); unsubUsers(); unsubServices(); unsubForum(); unsubLessons(); };
  }, []);

  // ADMINISTRATIVE ACTIONS
  const updateStudentStatus = async (id, field, value) => {
    const studentRef = doc(db, "course_applications", id);
    await updateDoc(studentRef, { [field]: value });
    alert(`ADMIN PROTOCOL: ${field} verified as ${value}`);
  };

  const deleteUser = async (id) => {
    if(window.confirm("CRITICAL: Permanent revocation of system access. Proceed?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) { alert("ERROR: System could not delete record."); }
    }
  };

  const handleAcademicUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Innan shine inda admin yake tura Lesson, Assignment ko Exam
      await addDoc(collection(db, "lessons"), {
        ...academicData,
        instructor: "SUPER_ADMIN",
        createdAt: serverTimestamp()
      });
      alert(`SUCCESS: ${academicData.type.toUpperCase()} deployed to ${academicData.course}`);
      setAcademicData({ ...academicData, title: '', content: '' });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  
    try {
    let finalContent = academicData.content;

    // Idan aka zaba Exam, muna so mu tabbatar an sa tsarin tambayoyi yadda ya kamata
    if (academicData.type === 'exam') {
      // Misalin yadda tsarin tambayoyin yake: 
      // "Q1: Mecece HTML? | A: Language, B: Food | Correct: A"
      // Amma zan saukaka maka shi a UI nan gaba
    }

    await addDoc(collection(db, "lessons"), {
      ...academicData,
      instructor: "SUPER_ADMIN",
      createdAt: serverTimestamp(),
      isGradable: academicData.type === 'exam' ? true : false // Yana nuna cewa wannan ana yin grading dinsa
    });

    alert("EXAM_DEPLOYED: Tsarin jarabawa ya tafi.");
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        comment: userData.comment,
        createdAt: serverTimestamp(),
        status: 'active',
        currentActivity: 'Just Joined'
      });

      const message = `*OFFICIAL ADMISSION NOTICE - AYAX ACADEMY*\n\n` +
                      `Hello *${userData.name}*,\nYour official account has been provisioned.\n\n` +
                      `*ACCESS CREDENTIALS:*\nIdentifier: ${userData.email}\nSecurity Key: ${userData.password}\nRole: ${userData.role.toUpperCase()}`;
      
      window.open(`https://wa.me/${userData.phone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
      setUserData({ name: '', email: '', phone: '', password: '', role: 'student', comment: '' });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) return;
    await addDoc(collection(db, `forum_threads/${activeThread.id}/replies`), {
      text: adminReply,
      sender: "SUPER_ADMIN",
      role: 'authority',
      createdAt: serverTimestamp()
    });
    setAdminReply('');
    alert("AUTHORITY_RESPONSE: Message injected into forum.");
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-72 bg-[#0f172a] text-white p-8 space-y-10 shrink-0 border-r border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black italic text-blue-500 tracking-tighter">AYAX ADMIN</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Authority Portal v2.0</p>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`nav-link ${activeTab === 'overview' ? 'active-nav' : ''}`}><LayoutDashboard size={18}/> Overview</button>
          <button onClick={() => setActiveTab('students')} className={`nav-link ${activeTab === 'students' ? 'active-nav' : ''}`}><Users size={18}/> Admissions</button>
          <button onClick={() => setActiveTab('academic')} className={`nav-link ${activeTab === 'academic' ? 'active-nav' : ''}`}><BookOpen size={18}/> Curriculum</button>
          <button onClick={() => setActiveTab('global_forum')} className={`nav-link ${activeTab === 'global_forum' ? 'active-nav' : ''}`}><MessageSquare size={18}/> Global Forum</button>
          <button onClick={() => setActiveTab('services')} className={`nav-link ${activeTab === 'services' ? 'active-nav' : ''}`}><Globe size={18}/> Services</button>
          <button onClick={() => setActiveTab('users')} className={`nav-link ${activeTab === 'users' ? 'active-nav' : ''}`}><ShieldCheck size={18}/> Access Control</button>
        </nav>
      </div>

      {/* MAIN DASHBOARD INTERFACE */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        
        {/* KPI METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="stat-card"><div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users size={24}/></div>
            <div><p className="metric-label">Applicants</p><h3 className="text-2xl font-black">{students.length}</h3></div>
          </div>
          <div className="stat-card"><div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Globe size={24}/></div>
            <div><p className="metric-label">Service Leads</p><h3 className="text-2xl font-black">{serviceRequests.length}</h3></div>
          </div>
          <div className="stat-card border-l-4 border-blue-600"><div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CreditCard size={24}/></div>
            <div><p className="metric-label">Revenue</p><h3 className="text-2xl font-black text-blue-600">₦{(students.filter(s => s.paymentStatus === 'Verified').length * 35000).toLocaleString()}</h3></div>
          </div>
          <div className="stat-card"><div className="p-3 bg-slate-900 rounded-2xl text-white"><ShieldCheck size={24}/></div>
            <div><p className="metric-label">Total Users</p><h3 className="text-2xl font-black">{systemUsers.length}</h3></div>
          </div>
        </div>

        {/* NEW ACADEMIC MANAGEMENT TAB */}
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 sticky top-0">
                <h3 className="text-xl font-black uppercase italic mb-6 text-slate-900">Deploy Material</h3>
                <form onSubmit={handleAcademicUpload} className="space-y-4">
                  <select className="admin-input" value={academicData.type} onChange={e => setAcademicData({...academicData, type: e.target.value})}>
                    <option value="video">VIDEO LESSON</option>
                    <option value="assignment">HOMEWORK/PROJECT</option>
                    <option value="exam">EXAMINATION</option>
                  </select>
                  <select className="admin-input" value={academicData.course} onChange={e => setAcademicData({...academicData, course: e.target.value})}>
                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input required className="admin-input" placeholder="TITLE (e.g. Week 1: Basics)" value={academicData.title} onChange={e => setAcademicData({...academicData, title: e.target.value})}/>
                  <input required className="admin-input" placeholder={academicData.type === 'video' ? "YOUTUBE LINK" : "RESOURCE LINK / DESC"} value={academicData.content} onChange={e => setAcademicData({...academicData, content: e.target.value})}/>
                  <input type="number" className="admin-input" placeholder="WEEK NUMBER" value={academicData.week} onChange={e => setAcademicData({...academicData, week: e.target.value})}/>
                  <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin"/> : <><PlusCircle size={18}/> Deploy to Curriculum</>}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Curriculum Stream</h3>
               {lessons.map(item => (
                 <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                       <div className={`p-4 rounded-2xl ${item.type === 'video' ? 'bg-blue-50 text-blue-600' : item.type === 'exam' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {item.type === 'video' ? <Video size={20}/> : item.type === 'exam' ? <Award size={20}/> : <FileText size={20}/>}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase">{item.course} • Week {item.week}</p>
                          <h4 className="font-black text-slate-900">{item.title}</h4>
                       </div>
                    </div>
                    <button onClick={async () => {if(window.confirm("Delete?")) await deleteDoc(doc(db, "lessons", item.id))}} className="p-3 text-gray-200 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* OVERVIEW: LIVE TRACKING */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
             <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-slate-900"><Activity size={16} className="text-blue-600"/> Activity Feed</h3>
             </div>
             <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase">
                    <th className="p-6">User</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Live Status</th>
                    <th className="p-6">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {systemUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                         <p className="font-black text-sm text-gray-900">{user.fullName}</p>
                         <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                      </td>
                      <td className="p-6">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'teacher' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                           {user.role}
                         </span>
                      </td>
                      <td className="p-6">
                         <p className="text-xs font-bold text-slate-600 italic">"{user.currentActivity || 'In Transit'}"</p>
                      </td>
                      <td className="p-6">
                         <p className="text-[10px] font-black text-gray-400">{user.lastInteraction?.toDate().toLocaleTimeString() || 'Waiting...'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {/* GLOBAL FORUM HUB */}
        {activeTab === 'global_forum' && (
          <div className="flex gap-8 h-[70vh]">
            <div className="w-1/3 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-slate-900 text-white font-black uppercase text-[10px]">Global Thread Stream</div>
              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {allThreads.map(thread => (
                  <div key={thread.id} onClick={() => setActiveThread(thread)} className={`p-6 cursor-pointer transition-all ${activeThread?.id === thread.id ? 'bg-red-50 border-r-4 border-r-red-600' : 'hover:bg-gray-50'}`}>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md uppercase mb-2 inline-block">{thread.course}</span>
                    <p className="font-black text-slate-900 text-sm">{thread.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">By: {thread.studentName}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
              {activeThread ? (
                <>
                  <div className="p-8 border-b bg-gray-50">
                    <h3 className="font-black text-2xl text-slate-900 mb-2">{activeThread.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{activeThread.content}</p>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto">
                     <div className="bg-red-600 text-white p-5 rounded-[2rem] rounded-tr-none ml-auto max-w-[80%] shadow-xl shadow-red-100 mb-4">
                        <p className="text-[10px] font-black uppercase mb-1 opacity-70">Administrator Override</p>
                        <p className="text-sm font-bold">You are interacting as Super Admin. Your reply is visible globally.</p>
                     </div>
                  </div>
                  <form onSubmit={handleAdminReply} className="p-6 border-t bg-white flex gap-4">
                    <input className="admin-input" placeholder="Inject administrative response..." value={adminReply} onChange={e => setAdminReply(e.target.value)}/>
                    <button className="p-5 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-black transition-all"><Send size={20}/></button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20"><ShieldCheck size={100}/><p className="font-black uppercase tracking-widest text-xs mt-4">Select Thread to Monitor</p></div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ADMISSIONS */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-gray-900 italic uppercase">Admission & Finance Hub</h2>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Student</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Receipt</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={s.passportUrl} className="w-12 h-12 rounded-2xl object-cover border" alt="Avatar" />
                          <div><p className="font-black text-gray-900 text-sm">{s.studentName}</p><p className="text-[10px] text-blue-600 font-bold uppercase">{s.course}</p></div>
                        </div>
                      </td>
                      <td className="p-6">
                        {s.receiptUrl ? (
                          <button onClick={() => window.open(s.receiptUrl, '_blank')} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2"><Eye size={14}/> VIEW</button>
                        ) : <span className="text-gray-300 font-bold text-[10px]">MISSING</span>}
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === 'Admitted' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{s.status || 'Pending'}</span>
                      </td>
                      <td className="p-6 flex justify-center gap-2">
                        <button onClick={() => updateStudentStatus(s.id, 'paymentStatus', 'Verified')} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200"><CreditCard size={16}/></button>
                        <button onClick={() => updateStudentStatus(s.id, 'status', 'Admitted')} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"><CheckCircle size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCESS CONTROL */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
              <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3"><UserPlus className="text-blue-600"/> Provision Access</h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-5">
                <input required className="admin-input" placeholder="FULL NAME" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})}/>
                <input required type="email" className="admin-input" placeholder="EMAIL" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})}/>
                <input required className="admin-input" placeholder="PHONE (234...)" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})}/>
                <input required className="admin-input" placeholder="SECURITY KEY" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})}/>
                <select className="admin-input" value={userData.role} onChange={e => setUserData({...userData, role: e.target.value})}>
                  <option value="student">STUDENT ROLE</option>
                  <option value="teacher">TEACHER ROLE</option>
                  <option value="admin">ADMIN ROLE</option>
                </select>
                <textarea className="admin-input h-14" placeholder="ADMIN REMARKS" value={userData.comment} onChange={e => setUserData({...userData, comment: e.target.value})}/>
                <button disabled={loading} className="col-span-2 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Register & Notify</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SERVICE REQUESTS */}
        {activeTab === 'services' && (
          <div className="grid md:grid-cols-2 gap-6">
            {serviceRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[9px] font-black rounded-full uppercase">{req.serviceType}</span>
                <h4 className="mt-3 font-black text-lg text-gray-900">{req.clientName}</h4>
                <p className="text-sm text-gray-500 font-medium">{req.projectDescription}</p>
                <p className="mt-4 text-xs font-bold text-blue-600">{req.phone} | {req.email}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 20px 25px; border-radius: 24px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white; box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.3); }
        .stat-card { background: white; padding: 25px; border-radius: 30px; display: flex; align-items: center; gap: 20px; border: 1px solid #f1f5f9; }
        .metric-label { text-transform: uppercase; font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 4px; }
        .admin-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; font-size: 0.85rem; outline: none; transition: 0.3s; }
        .admin-input:focus { border-color: #2563eb; background: white; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;