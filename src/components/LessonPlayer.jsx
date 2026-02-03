import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, BookOpen, PlayCircle, FileText, ChevronRight } from 'lucide-react';

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // Muna amfani da lessonId wajen kiran takamaiman darasi daga Firestore
        const docRef = doc(db, "courses", lessonId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLesson(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-900 font-black uppercase text-xs tracking-[0.3em] animate-pulse">Opening Classroom...</p>
        </div>
      </div>
    );
  }

  if (!lesson) return <div className="p-20 text-center font-bold text-red-500">Lesson not found. Check your connection or URL.</div>;

  // Function na mayar da YouTube link zuwa Embed format
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1` : null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black bg-blue-600 text-white px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
            {lesson.category || 'General'}
          </span>
        </div>
      </nav>

      {/* Main Classroom Layout */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row h-full">
        
        {/* Left: Video & Content Area */}
        <div className="lg:w-3/4 p-6 lg:p-12 border-r border-gray-50 overflow-y-auto">
          <div className="aspect-video w-full bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] mb-10 relative">
            {lesson.videoUrl ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={getEmbedUrl(lesson.videoUrl)} 
                title={lesson.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                <PlayCircle size={64} className="opacity-10" />
                <p className="font-bold text-sm uppercase tracking-widest">Technical Lecture Only</p>
              </div>
            )}
          </div>

          <div className="max-w-4xl">
            <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">{lesson.title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 mb-10 pb-10 border-b border-gray-100 text-[11px] uppercase tracking-[0.15em] font-black text-gray-400">
              <span className="flex items-center gap-2 text-blue-600"><BookOpen size={16}/> Global Curriculum</span>
              <span className="flex items-center gap-2"><FileText size={16}/> Resources Available</span>
              <span className="flex items-center gap-2 text-green-500"><ChevronRight size={16}/> Verified Content</span>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3 className="text-xl font-black text-gray-900 mb-6 italic flex items-center gap-3">
                <div className="w-8 h-1 bg-blue-600 rounded-full"></div> Lesson Overview
              </h3>
              <div className="text-gray-600 font-medium leading-[2] text-lg whitespace-pre-line">
                {lesson.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar Resources & Community */}
        <div className="lg:w-1/4 p-6 lg:p-10 bg-gray-50/30 min-h-[500px]">
          <div className="sticky top-32">
            <h3 className="font-black text-gray-400 mb-8 uppercase tracking-[0.3em] text-[10px]">Academic Materials</h3>
            
            <div className="space-y-4">
              {/* Asset Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-800 text-sm leading-tight">Technical_Notes.pdf</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase mt-1">1.2 MB • PDF Document</p>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white mt-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/40 transition-all"></div>
                <div className="relative z-10">
                  <h4 className="font-black text-xl mb-3 tracking-tighter">Need Clarity?</h4>
                  <p className="text-xs text-gray-400 mb-6 font-bold leading-relaxed">Engage with fellow architects in the community forum or ping your instructor.</p>
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all shadow-lg shadow-blue-900/20">
                    Join Discussion
                  </button>
                </div>
              </div>
              
              <p className="text-center text-[9px] text-gray-300 font-black uppercase mt-8 tracking-[0.2em]">AYAX University Infrastructure v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;