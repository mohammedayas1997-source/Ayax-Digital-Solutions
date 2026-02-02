import React from 'react';
import { PlayCircle, Clock, Star, Users } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600">
          {course.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-black text-gray-900 mb-2">{course.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Clock size={16} /> {course.duration}</span>
          <span className="flex items-center gap-1"><Users size={16} /> {course.students} Students</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-black text-blue-600">{course.price}</div>
          <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2">
            Enroll <PlayCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;