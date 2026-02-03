import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
// Na kara doc da updateDoc a nan domin sune ke sa error
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Send, User, ShieldCheck, MessageSquare } from 'lucide-react';

const StudentChat = ({ courseId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = auth.currentUser;
  const scrollRef = useRef();

  // 1. Listen for Messages
  useEffect(() => {
    if (!user || !courseId) return;

    const q = query(
      collection(db, "chats"),
      where("studentId", "==", user.uid),
      where("courseId", "==", courseId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [user, courseId]);

  // 2. Mark Messages as Read (Gyararre: An raba shi daban)
  useEffect(() => {
    const markAsRead = async () => {
      if (user && messages.length > 0) {
        const unreadMessages = messages.filter(m => m.sender === 'admin' && m.unread === true);
        
        // Muna amfani da Promise.all don ya fi sauri
        await Promise.all(unreadMessages.map(async (msg) => {
          const msgRef = doc(db, "chats", msg.id);
          return updateDoc(msgRef, { unread: false });
        }));
      }
    };
    
    markAsRead();
  }, [messages, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "chats"), {
        studentId: user.uid,
        studentName: user.displayName || "Student",
        courseId: courseId,
        text: newMessage,
        sender: "student",
        unread: true, // Kara unread domin Admin ya gani
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest opacity-60">Support Channel</p>
            <h3 className="font-black text-sm uppercase">Ayax Instructor</h3>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-[2rem] font-bold text-sm shadow-sm ${
              msg.sender === 'student' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-100 flex gap-3">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your question here..."
          className="flex-grow bg-gray-50 p-4 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
        />
        <button type="submit" className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default StudentChat;