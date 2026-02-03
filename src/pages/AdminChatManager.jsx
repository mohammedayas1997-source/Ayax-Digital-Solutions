import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore';
import { Send, User, MessageSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';

const AdminChatManager = () => {
  const { courseId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const scrollRef = useRef();

  // 1. Dauko dukkan conversations na wannan course din (Unique Student List)
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("courseId", "==", courseId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const uniqueStudents = [];
      const seen = new Set();
      
      allMsgs.forEach(msg => {
        if (!seen.has(msg.studentId)) {
          seen.add(msg.studentId);
          uniqueStudents.push({
            id: msg.studentId,
            name: msg.studentName,
            lastMessage: msg.text,
            time: msg.createdAt,
            // Bonus: muna duba idan akwai sako da admin bai gani ba a wannan student din
            hasUnread: msg.sender === "student" && msg.unreadByAdmin === true
          });
        }
      });
      setConversations(uniqueStudents);
    });

    return () => unsubscribe();
  }, [courseId]);

  // 2. Mark Messages as Read lokacin da Admin ya bude chat
  useEffect(() => {
    if (selectedStudent && messages.length > 0) {
      messages.forEach(async (msg) => {
        if (msg.sender === "student" && msg.unreadByAdmin === true) {
          const msgRef = doc(db, "chats", msg.id);
          await updateDoc(msgRef, { unreadByAdmin: false });
        }
      });
    }
  }, [messages, selectedStudent]);

  // 3. Dauko saƙonni na takamaiman ɗalibi
  useEffect(() => {
    if (!selectedStudent) return;

    const q = query(
      collection(db, "chats"),
      where("studentId", "==", selectedStudent.id),
      where("courseId", "==", courseId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [selectedStudent, courseId]);

  // 4. Aikaka Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedStudent) return;

    try {
      await addDoc(collection(db, "chats"), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        courseId: courseId,
        text: reply,
        sender: "admin",
        unreadByStudent: true, // Don nuna jan digo a bangaren dalibi
        unreadByAdmin: false,
        createdAt: serverTimestamp(),
      });
      setReply("");
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="flex h-[85vh] bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden m-4">
      {/* Sidebar: Student List */}
      <aside className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Messages
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest truncate">{courseId}</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {conversations.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all relative ${
                selectedStudent?.id === student.id ? 'bg-white shadow-md border border-gray-100' : 'hover:bg-gray-100/50'
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black shrink-0">
                {student.name ? student.name.charAt(0) : "U"}
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-black text-gray-900 text-sm truncate">{student.name}</p>
                <p className="text-[10px] text-gray-400 truncate font-medium">{student.lastMessage}</p>
              </div>
              {student.hasUnread && (
                <span className="absolute top-5 right-5 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className="flex-grow flex flex-col bg-white">
        {selectedStudent ? (
          <>
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
                   <User size={18} />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-tight">{selectedStudent.name}</h3>
              </div>
            </div>

            <div className="flex-grow p-8 overflow-y-auto space-y-6 bg-gray-50/20">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-5 rounded-[2rem] font-bold text-sm shadow-sm ${
                    msg.sender === 'admin' 
                    ? 'bg-gray-900 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendReply} className="p-8 border-t border-gray-50 flex gap-4">
              <input 
                type="text" 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Reply to ${selectedStudent.name}...`}
                className="flex-grow bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:bg-white"
              />
              <button type="submit" className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 shrink-0">
                <Send size={24} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-300">
            <MessageSquare size={80} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-sm opacity-40">Select a student to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminChatManager;