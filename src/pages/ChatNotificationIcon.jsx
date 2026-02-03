import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const ChatNotificationIcon = ({ courseId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && courseId) {
        try {
          // Wannan query din yana bukatar Composite Index a Firebase Console
          const q = query(
            collection(db, "chats"),
            where("studentId", "==", user.uid),
            where("courseId", "==", courseId),
            where("sender", "==", "admin"),
            where("unread", "==", true)
          );

          unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.docs.length);
          }, (error) => {
            console.error("🔥 Notification Listener Error:", error.message);
          });
        } catch (err) {
          console.error("🔥 Chat Icon Error:", err);
        }
      } else {
        setUnreadCount(0);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    // Cleanup function: muna goge duka biyun lokacin da component ya mutu
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [courseId]); 

  return (
    <button 
      onClick={() => navigate(`/course/${courseId}/chat`)}
      className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
    >
      <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-lg">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatNotificationIcon;