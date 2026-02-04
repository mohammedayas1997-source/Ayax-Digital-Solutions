import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth'; 
import { 
  collection, onSnapshot, updateDoc, doc, 
  addDoc, serverTimestamp, deleteDoc, query, orderBy, where, setDoc, getDoc 
} from 'firebase/firestore'; 
import { 
  Users, BookOpen, CreditCard, LayoutDashboard, 
  CheckCircle, Trash2, Award, Globe, UserPlus, Eye, 
  Phone, MessageSquare, Send, Loader2, ShieldCheck, 
  XCircle, Activity, ShieldAlert, Search, Video, FileText, 
  ClipboardList, PlusCircle, Moon, Sun, LogOut, History, BarChart3 
} from 'lucide-react';
import emailjs from '@emailjs/browser';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0);

  const [lessons, setLessons] = useState([]);
  const [academicData, setAcademicData] = useState({
    type: 'video', 
    title: '',
    content: '', 
    week: '1',
    course: 'Web Development',
    dueDate: '' 
  });

  const [weekSchedule, setWeekSchedule] = useState({
    week: '1',
    startDate: '',
    endDate: ''
  });

  const [forumData, setForumData] = useState({
    title: '',
    content: '',
    course: 'Web Development'
  });

  const availableCourses = ["Web Development", "Graphic Design", "Digital Marketing", "Cyber Security"];

  const [userData, setUserData] = useState({
    name: '', email: '', phone: '', password: '', role: 'student', comment: ''
  });

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

    const qLogs = query(collection(db, "system_logs"), orderBy("timestamp", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      setHistoryLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubStudents(); unsubUsers(); unsubServices(); 
      unsubForum(); unsubLessons(); unsubLogs();
    };
  }, []);

  const approveCertificate = async (studentId) => {
    try {
      await updateDoc(doc(db, "users", studentId), {
        certificateApproved: true,
        graduationDate: serverTimestamp(),
        status: "Graduated"
      });
      alert("Certificate approved and visible to student!");
    } catch (err) {
      console.error(err);
    }
  };

  const deactivateStudent = async (studentId) => {
    try {
      await updateDoc(doc(db, "users", studentId), {
        accountStatus: "Deactivated",
        accessRevoked: true
      });
      alert("Student account deactivated successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentGraduation = async (student) => {
    const PUBLIC_KEY = "Zq65aNb8G1g9F7XkY";
    const SERVICE_ID = "YOUR_SERVICE_ID"; 
    const TEMPLATE_ID = "YOUR_TEMPLATE_ID";

    const emailParams = {
      to_name: student.fullName,
      to_email: student.email,
      course_name: student.course || "Full Stack Web Development",
      certificate_link: `https://ayax-university.com/verify/${student.id}`,
      admin_contact: "ayaxdigitalsolutions@gmail.com"
    };

    try {
      const emailRes = await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY);
      if (emailRes.status === 200) {
        const studentRef = doc(db, "users", student.id);
        await updateDoc(studentRef, {
          certificateApproved: true,
          accountStatus: "Deactivated", 
          graduationDate: serverTimestamp(),
          accessLevel: "Graduated"
        });
        alert(`Success: Certificate sent to ${student.email} and account deactivated.`);
      }
    } catch (error) {
      console.error("Workflow Error:", error);
      alert("Critical Error: Process interrupted. Check console for details.");
    }
  };

  const handleSetSchedule = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "schedules", `week_${weekSchedule.week}`), {
        ...weekSchedule,
        updatedAt: serverTimestamp()
      });
      alert(`An saita lokacin Week ${weekSchedule.week} cikin nasara!`);
    } catch (err) {
      await addDoc(collection(db, "schedules"), {
        ...weekSchedule,
        id: `week_${weekSchedule.week}`,
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleLogout = async () => {
    if(window.confirm("Are you sure you want to logout?")) {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) { alert("Logout failed"); }
    }
  };

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
      await addDoc(collection(db, "lessons"), {
        ...academicData,
        instructor: "SUPER_ADMIN",
        createdAt: serverTimestamp(),
        isGradable: academicData.type === 'exam' || academicData.type === 'assignment'
      });
      alert(`SUCCESS: ${academicData.type.toUpperCase()} deployed to ${academicData.course}`);
      setAcademicData({ ...academicData, title: '', content: '', dueDate: '' });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "forum_threads"), {
        ...forumData,
        studentName: "SUPER_ADMIN",
        role: 'authority',
        createdAt: serverTimestamp()
      });
      alert("OFFICIAL: Discussion thread launched.");
      setForumData({ title: '', content: '', course: 'Web Development' });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const createNewUser = async (email, password, fullName, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profileData = {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
        accountStatus: "Active",
      };

      if (role === 'student') {
        profileData.currentWeek = 1;
        profileData.averageScore = 0;
        profileData.certificateApproved = false;
      }

      await setDoc(doc(db, "users", user.uid), profileData);
      alert(`${role.toUpperCase()} created successfully!`);
    } catch (error) {
      alert("Error: " + error.message);
    }
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

  // Helper Component for Activity
  const AdminStudentActivity = ({ courseId, selectedWeek }) => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
      const q = query(
        collection(db, "submissions"),
        where("course", "==", courseId),
        where("week", "==", parseInt(selectedWeek))
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }, [courseId, selectedWeek]);

    useEffect(() => {
      const yau = new Date();
      yau.setHours(0, 0, 0, 0);
      const q = query(collection(db, "submissions"), where("createdAt", ">=", yau));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNewSubmissionsCount(snapshot.size);
      });
      return () => unsubscribe();
    }, []);

    return (
      <div className="bg-white rounded-[2rem] border shadow-xl overflow-hidden mt-6">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-black text-xs uppercase italic">Activity Tracker: Week {selectedWeek}</h3>
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black">{submissions.length} SUBMISSIONS</span>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50/50">
            <tr>
              <th className="p-6">Student</th>
              <th className="p-6">Type</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-blue-50/30">
                <td className="p-6 font-bold text-sm">{sub.studentName}</td>
                <td className="p-6"><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-[9px] font-black">{sub.type}</span></td>
                <td className="p-6 text-[10px] font-bold">{sub.status || 'Pending'}</td>
                <td className="p-6 flex justify-center gap-2">
                  <button onClick={() => updateDoc(doc(db, "submissions", sub.id), { status: 'Graded' })} className="p-2 bg-green-500 text-white rounded-lg"><CheckCircle size={14}/></button>
                  <button onClick={() => deleteDoc(doc(db, "submissions", sub.id))} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f1f5f9] text-slate-900'}`}>
      <div className={`w-72 p-8 space-y-10 shrink-0 border-r shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-[#1e293b] border-white/5' : 'bg-[#0f172a] text-white border-transparent'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic text-blue-500 tracking-tighter">AYAX ADMIN</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Authority Portal v2.0</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            {darkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-blue-400"/>}
          </button>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${activeTab === 'overview' ? 'bg-blue-600 text-white' : ''}`}><LayoutDashboard size={18}/> Overview</button>
          <button onClick={() => setActiveTab('students')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${activeTab === 'students' ? 'bg-blue-600 text-white' : ''}`}><Users size={18}/> Admissions</button>
          <button onClick={() => setActiveTab('academic')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${activeTab === 'academic' ? 'bg-blue-600 text-white' : ''}`}><BookOpen size={18}/> Curriculum</button>
          <button onClick={() => setActiveTab('engagement')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest relative ${activeTab === 'engagement' ? 'bg-blue-600 text-white' : ''}`}>
            <BarChart3 size={18}/> 
            Engagement Tracker
            {newSubmissionsCount > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg border-2 border-white">
                {newSubmissionsCount}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${activeTab === 'users' ? 'bg-blue-600 text-white' : ''}`}><ShieldCheck size={18}/> Access Control</button>
          <div className="pt-10">
            <button onClick={handleLogout} className="w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-red-400 hover:bg-red-500/10"><LogOut size={18}/> Logout</button>
          </div>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'engagement' && (
          <AdminStudentActivity courseId="Web Development" selectedWeek={selectedWeek} />
        )}
        {/* Ragowar Tabs dinka zasu zo anan kamar yadda kake dasu */}
      </div>
    

      {/* MAIN DASHBOARD INTERFACE */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        
        {/* KPI METRICS */}
        {activeTab !== 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className={`stat-card ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users size={24}/></div>
            <div><p className="metric-label">Applicants</p><h3 className="text-2xl font-black">{students.length}</h3></div>
          </div>
          <div className={`stat-card ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Globe size={24}/></div>
            <div><p className="metric-label">Service Leads</p><h3 className="text-2xl font-black">{serviceRequests.length}</h3></div>
          </div>
          <div className={`stat-card border-l-4 border-blue-600 ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CreditCard size={24}/></div>
            <div><p className="metric-label">Revenue</p><h3 className="text-2xl font-black text-blue-600">₦{(students.filter(s => s.paymentStatus === 'Verified').length * 35000).toLocaleString()}</h3></div>
          </div>
          <div className={`stat-card ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
            <div className="p-3 bg-slate-900 rounded-2xl text-white"><ShieldCheck size={24}/></div>
            <div><p className="metric-label">Total Users</p><h3 className="text-2xl font-black">{systemUsers.length}</h3></div>
          </div>
        </div>
        )}

        {/* HISTORY LOGS TAB */}
        {activeTab === 'history' && (
          <div className={`rounded-[2.5rem] shadow-xl border overflow-hidden animate-in slide-in-from-bottom-4 ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="p-8 border-b bg-gray-50/5 flex items-center justify-between">
              <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">System Audit Logs</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-100/10">
                  <th className="p-6">Action</th>
                  <th className="p-6">Details</th>
                  <th className="p-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {historyLogs.map(log => (
                  <tr key={log.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="p-6"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase">{log.action}</span></td>
                    <td className="p-6 text-sm font-medium">{log.details}</td>
                    <td className="p-6 text-[10px] text-gray-400">{log.timestamp?.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-black mb-10 tracking-tighter text-blue-400">SUPER ADMIN</h2>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-white/5'}`}
          >
            System Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('engagement')}
            className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'engagement' ? 'bg-blue-600' : 'hover:bg-white/5'}`}
          >
            Engagement Tracker
          </button>
          
          {/* Sauran buttons na Admin dinka na nan... */}
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-10">
            <h1 className="text-3xl font-black">Welcome, Chief.</h1>
            {/* Abinda ke cikin overview dinka na asali */}
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="p-4 md:p-8">
            {/* Control Bar na canza Week */}
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm flex items-center gap-4">
              <span className="font-black text-[10px] uppercase text-gray-400">Select Week:</span>
              {[1, 2, 3, 4].map(w => (
                <button 
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-4 py-2 rounded-lg font-black text-xs ${selectedWeek === w ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Week {w}
                </button>
              ))}
            </div>

            {/* Kiran Tracker Component din da muka gina */}
            <AdminStudentActivity 
              courseId="full-stack-web" // Ka sa courseId din da kake amfani da shi
              selectedWeek={selectedWeek} 
            />
          </div>
       )}
      </div>
    </div>
  );

        {/* ACADEMIC MANAGEMENT */}
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
              <div className={`p-10 rounded-[3rem] shadow-xl border sticky top-0 ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
                <h3 className="text-xl font-black uppercase italic mb-6">Deploy Material</h3>
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
                  <div className="flex gap-2">
                     <input type="number" className="admin-input w-1/2" placeholder="WEEK" value={academicData.week} onChange={e => setAcademicData({...academicData, week: e.target.value})}/>
                     <input type="date" className="admin-input w-1/2" value={academicData.dueDate} onChange={e => setAcademicData({...academicData, dueDate: e.target.value})}/>
                  </div>
                  <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin"/> : <><PlusCircle size={18}/> Deploy to Curriculum</>}
                  </button>
                  <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-dashed border-blue-200 mb-8">
  <h3 className="font-black text-xs uppercase mb-4 flex items-center gap-2 text-blue-700">
    <ClipboardList size={16}/> Set Weekly Academic Duration (7 Days)
  </h3>
  <form onSubmit={handleSetSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <select 
      className="p-3 rounded-xl border font-bold text-xs"
      value={weekSchedule.week}
      onChange={(e) => setWeekSchedule({...weekSchedule, week: e.target.value})}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w}>Week {w}</option>)}
    </select>
    
    <div className="flex flex-col">
      <label className="text-[9px] font-black ml-2 mb-1">START DATE</label>
      <input 
        type="date" 
        className="p-3 rounded-xl border text-xs font-bold"
        onChange={(e) => setWeekSchedule({...weekSchedule, startDate: e.target.value})}
      />
    </div>
    
    <div className="flex flex-col">
      <label className="text-[9px] font-black ml-2 mb-1">END DATE</label>
      <input 
        type="date" 
        className="p-3 rounded-xl border text-xs font-bold"
        onChange={(e) => setWeekSchedule({...weekSchedule, endDate: e.target.value})}
      />
    </div>
    
    <button className="bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-blue-700 mt-auto py-4">
      Save Schedule
    </button>
  </form>
</div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Curriculum Stream</h3>
                {lessons.length > 0 ? lessons.map(item => (
                  <div key={item.id} className={`p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
                     <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${item.type === 'video' ? 'bg-blue-50 text-blue-600' : item.type === 'exam' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                           {item.type === 'video' ? <Video size={20}/> : item.type === 'exam' ? <Award size={20}/> : <FileText size={20}/>}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-600 uppercase">{item.course} • Week {item.week}</p>
                           <h4 className="font-black">{item.title}</h4>
                        </div>
                     </div>
                     <button onClick={async () => {if(window.confirm("Delete?")) await deleteDoc(doc(db, "lessons", item.id))}} className="p-3 text-gray-200 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                  </div>
                )) : <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs">No lessons deployed yet.</div>}
            </div>
          </div>
        )}

        {/* OVERVIEW: LIVE TRACKING */}
        {activeTab === 'overview' && (
          <div className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
             <div className="p-8 border-b bg-gray-50/5 flex justify-between items-center">
                <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2"><Activity size={16} className="text-blue-600"/> Activity Feed</h3>
             </div>
             <table className="w-full text-left">
                <thead className="bg-gray-50/5">
                  <tr className="text-[10px] font-black text-gray-400 uppercase">
                    <th className="p-6">User</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Live Status</th>
                    <th className="p-6">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/10">
                  {systemUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/5 transition-colors">
                      <td className="p-6">
                          <p className="font-black text-sm">{user.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                      </td>
                      <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'teacher' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {user.role}
                          </span>
                      </td>
                      <td className="p-6">
                          <p className="text-xs font-bold italic">"{user.currentActivity || 'In Transit'}"</p>
                      </td>
                      <td className="p-6">
                          <p className="text-[10px] font-black text-gray-400">{user.lastInteraction ? user.lastInteraction.toDate().toLocaleTimeString() : 'Waiting...'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {/* FORUM MANAGEMENT (Complete) */}
        {activeTab === 'global_forum' && (
          <div className="flex gap-8 h-[75vh]">
            <div className={`w-1/3 p-8 rounded-[2.5rem] border shadow-xl flex flex-col ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
               <h3 className="font-black italic uppercase text-xs mb-6">Initiate Discussion</h3>
               <form onSubmit={handleCreateForum} className="space-y-4">
                  <select className="admin-input" value={forumData.course} onChange={e => setForumData({...forumData, course: e.target.value})}>
                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input required className="admin-input" placeholder="Title" value={forumData.title} onChange={e => setForumData({...forumData, title: e.target.value})}/>
                  <textarea required className="admin-input h-32" placeholder="Opening content..." value={forumData.content} onChange={e => setForumData({...forumData, content: e.target.value})}/>
                  <button className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Launch Thread</button>
               </form>
               <hr className="my-6 border-gray-100/10" />
               <div className="overflow-y-auto flex-1">
                {allThreads.map(thread => (
                  <div key={thread.id} onClick={() => setActiveThread(thread)} className={`p-4 mb-2 rounded-2xl cursor-pointer transition-all ${activeThread?.id === thread.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-50/5 border'}`}>
                    <p className="text-[10px] font-black uppercase opacity-60">{thread.course}</p>
                    <p className="font-bold text-sm truncate">{thread.title}</p>
                  </div>
                ))}
               </div>
            </div>
            
            <div className={`flex-1 rounded-[2.5rem] shadow-2xl border flex flex-col overflow-hidden ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white'}`}>
              {activeThread ? (
                <>
                  <div className="p-8 border-b bg-gray-50/5">
                    <h3 className="font-black text-2xl mb-2">{activeThread.title}</h3>
                    <p className="text-sm opacity-70">{activeThread.content}</p>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto">
                     <div className="bg-red-600 text-white p-5 rounded-[2rem] rounded-tr-none ml-auto max-w-[80%] shadow-xl mb-4">
                        <p className="text-[10px] font-black uppercase mb-1 opacity-70">Administrator Authority</p>
                        <p className="text-sm font-bold">Post your reply as Super Admin.</p>
                     </div>
                  </div>
                  <form onSubmit={handleAdminReply} className="p-6 border-t border-gray-100/10 flex gap-4">
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

        {/* ADMISSIONS */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black italic uppercase">Admission & Finance Hub</h2>
            <div className={`rounded-[2.5rem] shadow-xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
              <table className="w-full text-left">
                <thead className="bg-gray-50/5 border-b border-gray-100/10">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Student</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Receipt</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/10">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={s.passportUrl} className="w-12 h-12 rounded-2xl object-cover border" alt="Avatar" />
                          <div><p className="font-black text-sm">{s.studentName}</p><p className="text-[10px] text-blue-600 font-bold uppercase">{s.course}</p></div>
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
            <div className={`p-10 rounded-[3rem] shadow-xl border ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
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
            
            {/* System Users List (Added to make it complete) */}
            <div className={`p-10 rounded-[3rem] shadow-xl border ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
              <h3 className="font-black text-xs uppercase mb-6">Active System Users</h3>
              <div className="space-y-3">
                {systemUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                      <p className="font-bold text-sm">{user.fullName}</p>
                      <p className="text-[10px] opacity-60 uppercase">{user.role}</p>
                    </div>
                    <button onClick={() => deleteUser(user.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
  <div className="animate-in fade-in duration-500">
     <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-[2rem] shadow-sm border">
        <h2 className="text-xl font-black uppercase italic">Student Engagement</h2>
        <div className="flex gap-2">
           {[1, 2, 3, 4].map(w => (
             <button 
               key={w} 
               onClick={() => setSelectedWeek(w)} 
               className={`px-5 py-2 rounded-xl font-black text-[10px] ${selectedWeek === w ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
             >
               WEEK {w}
             </button>
           ))}
        </div>
     </div>
     {/* Kiran Tracker Component anan */}
     <AdminStudentActivity courseId="Web Development" selectedWeek={selectedWeek} />
  </div>
)}
<div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mb-6">
  <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
        {student.fullName.charAt(0)}
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{student.fullName}</h4>
        <div className="flex gap-3 mt-1">
          <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">Grade: {student.averageScore}%</span>
          <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-md">{student.course}</span>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-3">
      {/* STEP 1: APPROVE */}
      <button 
        onClick={() => approveCertificate(student.id)}
        disabled={student.certificateApproved}
        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 ${
          student.certificateApproved ? 'bg-gray-100 text-gray-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100'
        }`}
      >
        <CheckCircle size={16}/> {student.certificateApproved ? "Approved" : "Approve Certificate"}
      </button>

      {/* STEP 2: EMAIL */}
      <button 
        onClick={() => sendCertificateEmail(student)}
        className="px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
      >
        <Mail size={16}/> Send via Email
      </button>

      {/* STEP 3: DEACTIVATE */}
      <button 
        onClick={() => {
          if(window.confirm("CAUTION: Deactivating will lock the student out forever. Proceed?")) {
            deactivateStudent(student.id);
          }
        }}
        className="px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
      >
        <UserX size={16}/> Terminate Access
      </button>
    </div>
  </div>
</div>

<div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
  <div className="flex items-center gap-5">
    <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
      {student.fullName.charAt(0)}
    </div>
    <div>
      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{student.fullName}</h4>
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{student.email}</p>
    </div>
  </div>

  <div className="flex items-center gap-4">
    <div className="text-right mr-4 border-r pr-4 border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase">Average Grade</p>
      <p className="text-xl font-black text-slate-900">{student.averageScore}%</p>
    </div>

    <button 
      onClick={() => handleStudentGraduation(student)}
      className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg flex items-center gap-3"
    >
      <Award size={16}/> Approve & Graduate
    </button>
  </div>
</div>
        {/* SERVICE REQUESTS */}
        {activeTab === 'services' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {serviceRequests.length > 0 ? serviceRequests.map(req => (
              <div key={req.id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[9px] font-black rounded-full uppercase">{req.serviceType || 'General Request'}</span>
                  <button onClick={() => window.open(`tel:${req.phone}`)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Phone size={14}/></button>
                </div>
                <h4 className="font-black text-lg">{req.clientName}</h4>
                <p className="text-sm opacity-60 font-medium mb-4 flex-1">{req.projectDescription || req.message}</p>
                <div className="pt-4 border-t border-gray-50 mt-auto">
                  <p className="text-[10px] font-bold text-blue-600 flex items-center gap-2 uppercase italic"><MessageSquare size={12}/> {req.email}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{req.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
              </div>
            )) : <div className="col-span-2 p-20 text-center font-black text-gray-300 uppercase tracking-[0.5em]">No new service requests detected.</div>}
          </div>
        )}

      </div>

      <style>{`
        .nav-link { width: 100%; display: flex; align-items: center; gap: 15px; padding: 20px 25px; border-radius: 24px; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; transition: 0.4s; }
        .active-nav { background: #2563eb; color: white !important; box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.3); }
        .stat-card { padding: 25px; border-radius: 30px; display: flex; align-items: center; gap: 20px; transition: 0.3s; }
        .metric-label { text-transform: uppercase; font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 4px; }
        .admin-input { width: 100%; padding: 1.25rem; background: ${darkMode ? '#0f172a' : '#f8fafc'}; border: 2px solid transparent; border-radius: 1.25rem; font-weight: 700; font-size: 0.85rem; outline: none; transition: 0.3s; color: ${darkMode ? 'white' : 'black'}; }
        .admin-input:focus { border-color: #2563eb; background: ${darkMode ? '#1e293b' : 'white'}; }
      `}</style>
    </div>
  );
};

export default SuperAdmin;