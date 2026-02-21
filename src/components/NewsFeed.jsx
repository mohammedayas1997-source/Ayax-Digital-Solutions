import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Bell,
  Newspaper,
  Clock,
  ArrowRight,
  Zap,
  X,
  Calendar,
  Share2,
} from "lucide-react";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null); // State for the Modal

  useEffect(() => {
    const q = query(
      collection(db, "news_feed"),
      orderBy("createdAt", "desc"),
      limit(6),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(newsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- REAL-LIFE SHARE PROTOCOL ---
  const handleShare = async (article) => {
    const shareData = {
      title: article.title,
      text: `Check out this update from Ayax Academy: ${article.title}`,
      url: window.location.href, // Sharing the current page URL
    };

    try {
      if (navigator.share) {
        // Triggers native mobile share menu
        await navigator.share(shareData);
      } else {
        // Fallback for desktop: Copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`,
        );
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Sharing failed", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <section className="py-24 bg-white font-sans relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <Zap size={20} className="fill-blue-600" />
              <span className="font-black uppercase tracking-[0.3em] text-xs">
                Stay Informed
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 uppercase">
              Ayax <span className="text-blue-600">News Feed</span>
            </h2>
          </div>
          <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3">
            View All Updates <ArrowRight size={16} />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedArticle(item)} // This opens the article
              className="group bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl font-black text-[9px] uppercase tracking-widest text-blue-600">
                  {item.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 text-slate-400 mb-4 text-[10px] font-bold uppercase">
                  <Clock size={12} />
                  {item.createdAt?.toDate().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-xl font-black mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                  {item.content}
                </p>
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                    Read Article
                  </span>
                  <div className="p-3 bg-white rounded-full text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {news.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Newspaper size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-black uppercase text-xs text-slate-400 tracking-widest">
              No active updates at the moment.
            </p>
          </div>
        )}
      </div>

      {/* --- ARTICLE READER MODAL (SABON GYARA) --- */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
            onClick={() => setSelectedArticle(null)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header/Image */}
            <div className="relative h-64 sm:h-80 shrink-0">
              <img
                src={
                  selectedArticle.image ||
                  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070"
                }
                className="w-full h-full object-cover"
                alt={selectedArticle.title}
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-4 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-blue-600 transition-all z-10"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-6 left-8 px-5 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">
                {selectedArticle.category}
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 text-slate-400 mb-6 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />{" "}
                  {selectedArticle.createdAt?.toDate().toLocaleDateString()}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="text-blue-600">Ayax Official Update</div>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tighter italic uppercase">
                {selectedArticle.title}
              </h2>

              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap">
                  {selectedArticle.content}
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  © 2026 Ayax Digital Solutions Academy
                </p>
                <button
                  onClick={() => handleShare(selectedArticle)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 transition-transform"
                >
                  <Share2 size={14} /> Share News
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </section>
  );
};

export default NewsFeed;
