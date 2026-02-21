import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ImageIcon, Maximize2, X, Camera, Zap } from "lucide-react";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setImages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <section className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Camera size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Visual Archives
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            AYAX <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-slate-500 font-medium mt-6 max-w-xl mx-auto">
            Experience our technical workshops, graduation ceremonies, and
            high-end digital infrastructure in high definition.
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center p-20">
            <Zap className="animate-bounce text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImg(img.url)}
                className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer border-4 border-white shadow-xl hover:scale-[1.02] transition-all duration-500"
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={img.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                  <p className="text-white font-black uppercase text-lg italic">
                    {img.title}
                  </p>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                    {img.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Pop-up */}
        {selectedImg && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-10 right-10 text-white hover:text-blue-500 transition-colors"
            >
              <X size={40} />
            </button>
            <img
              src={selectedImg}
              className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border-2 border-white/10 animate-in zoom-in-95 duration-300"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
