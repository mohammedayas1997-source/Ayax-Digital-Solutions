import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Clock, ArrowRight, Zap, Newspaper } from "lucide-react";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Jawo labarai 3 na karshe (Latest)
    const q = query(
      collection(db, "news_feed"),
      orderBy("createdAt", "desc"),
      limit(3),
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

  if (loading) return null; // Ko ka saka spinner
  if (news.length === 0) return null; // Kar ya nuna komai idan babu labari

  return (
    <section className="py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <Zap size={20} className="fill-blue-600" />
              <span className="font-black uppercase tracking-[0.3em] text-xs">
                Stay Updated
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 uppercase">
              Latest <span className="text-blue-600">News Feed</span>
            </h2>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {news.map((item) => (
            <article
              key={item.id}
              className="group bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="news"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl font-black text-[9px] uppercase tracking-widest text-blue-600 shadow-sm">
                  {item.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-10">
                <div className="flex items-center gap-2 text-slate-400 mb-4 text-[10px] font-bold uppercase">
                  <Clock size={12} />
                  {item.createdAt
                    ?.toDate()
                    .toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors leading-tight uppercase italic">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                  {item.content}
                </p>
                <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all flex items-center justify-center gap-3">
                  Read Full Update <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
