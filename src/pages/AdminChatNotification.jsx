import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { BellRing } from 'lucide-react';

const AdminChatNotification = ({ courseId }) => {
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  useEffect(() => {
    if (!courseId) return;

    // Nemo dukkan saƙonni daga ɗalibai na wannan kwas ɗin da Admin bai gani ba
    const q = query(
      collection(db, "chats"),
      where("courseId", "==", courseId),
      where("sender", "==", "student"),
      where("unreadByAdmin", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Wannan zai sabunta count din duk lokacin da sako ya shigo ko aka karanta shi
      setAdminUnreadCount(snapshot.docs.length);
    }, (error) => {
      console.error("Notification Listener Error:", error);
    });

    return () => unsubscribe();
  }, [courseId]);

  // Idan babu sako, kar a nuna komai
  if (adminUnreadCount === 0) return null;

  return (
    <div className="group flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 transition-all hover:bg-orange-100">
      <div className="relative">
        <BellRing 
          size={18} 
          className="animate-[bounce_2s_infinite] group-hover:rotate-12 transition-transform" 
        />
        {/* Dan digon nan na nuna alamar akwai sabon abu */}
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
          Attention Required
        </span>
        <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest mt-1">
          {adminUnreadCount} {adminUnreadCount === 1 ? 'Message' : 'New Messages'}
        </span>
      </div>
    </div>
  );
};

export default AdminChatNotification;