import React, { useEffect, useState } from 'react';
import { auth } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, LogOut, MessageSquare, Briefcase, Trash2, 
  Power, PowerOff, User, MessageCircle, BadgeCheck, Send 
} from 'lucide-react';

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [replies, setReplies] = useState({});
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load Registration Status
    const loadSettings = async () => {
      const regRef = doc(db, "settings", "registration");
      const docSnap = await getDoc(regRef);
      if (docSnap.exists()) {
        setIsRegistrationOpen(docSnap.data().isOpen);
      }
      setLoading(false);
    };
    loadSettings();

    // 2. Real-time Subscription for Inquiries
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => unsub();
  }, []);

  // Function to Toggle Portal
  const togglePortal = async () => {
    const newStatus = !isRegistrationOpen;
    const regRef = doc(db, "settings", "registration");
    try {
      await updateDoc(regRef, { isOpen: newStatus });
      setIsRegistrationOpen(newStatus);
    } catch (err) {
      alert("Error updating portal: " + err.message);
    }
  };

  // Function to Update Lead Status
  const updateStatus = async (id, newStatus) => {
    const leadRef = doc(db, "inquiries", id);
    await updateDoc(leadRef, { status: newStatus });
  };

  // Function to Send Reply
  const sendReply = async (id) => {
    const replyText = replies[id];
    if (!replyText) return alert("Please write a response first!");

    const leadRef = doc(db, "inquiries", id);
    try {
      await updateDoc(leadRef, {
        adminResponse: replyText,
        status: 'Responded'
      });
      alert("Response sent successfully!");
      setReplies(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert("Failed to send reply: " + err.message);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Loading Admin Panel...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden lg:block fixed h-full left-0">
        <div className="text-2xl font-black mb-10 text-blue-400 tracking-tighter">AYAX ADMIN</div>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl cursor-pointer font-bold shadow-lg shadow-blue-900/20">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="flex items-center gap-3 p-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl w-full transition-all mt-auto"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-8 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Management Console</h1>
            <p className="text-gray-500 font-medium">Manage your project inquiries and school portal.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Portal Switch */}
            <button 
              onClick={togglePortal}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white transition-all shadow-xl ${
                isRegistrationOpen 
                ? 'bg-green-600 shadow-green-200 hover:bg-green-700' 
                : 'bg-red-600 shadow-red-200 hover:bg-red-700'
              }`}
            >
              {isRegistrationOpen ? <Power size={20}/> : <PowerOff size={20}/>}
              {isRegistrationOpen ? "PORTAL: LIVE" : "PORTAL: CLOSED"}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-bold text-sm uppercase">Total Inquiries</p>
            <h2 className="text-3xl font-black text-gray-900">{leads.length}</h2>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="space-y-8">
          {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">No inquiries found in database.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                      <User size={24}/>
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-gray-900 leading-tight">{lead.fullName}</h3>
                      <p className="text-gray-500 font-medium">{lead.email} | <span className="text-blue-600 font-bold uppercase text-xs tracking-widest">{lead.serviceTier}</span></p>
                    </div>
                  </div>
                  <select 
                    value={lead.status || "Pending"}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-none shadow-sm ${
                      lead.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      lead.status === 'Responded' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Responded">Responded</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-6 rounded-[1.5rem] mb-8 relative">
                   <div className="text-gray-700 font-medium leading-relaxed italic">
                    "{lead.message}"
                   </div>
                </div>

                {/* --- REPLY AREA --- */}
                <div className="border-t border-gray-100 pt-8">
                  {lead.adminResponse && (
                    <div className="mb-6 p-6 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-3xl animate-in fade-in">
                      <p className="font-black text-blue-900 text-sm flex items-center gap-2 mb-2 uppercase tracking-tight">
                        <BadgeCheck size={18}/> Your Previous Response:
                      </p>
                      <p className="text-blue-800 font-medium">{lead.adminResponse}</p>
                    </div>
                  )}

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Official Reply</label>
                      <textarea 
                        value={replies[lead.id] || ""}
                        onChange={(e) => setReplies({ ...replies, [lead.id]: e.target.value })}
                        placeholder="Write your professional response..."
                        className="w-full p-5 bg-gray-50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[120px]"
                      />
                    </div>
                    <button 
                      onClick={() => sendReply(lead.id)}
                      className="bg-gray-900 text-white p-6 rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 group h-[120px] w-[100px] flex flex-col items-center justify-center gap-2"
                    >
                      <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;