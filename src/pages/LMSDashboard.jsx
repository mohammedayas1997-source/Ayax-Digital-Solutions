import React from "react";
import { BookOpen, Trophy, Clock, CheckCircle } from "lucide-react";

const LMSDashboard = () => {
  // Jerin sunayen courses da aka gyara kamar yadda ka nema
  const myCourses = [
    { title: "Cyber security", progress: 45, status: "In Progress" },
    { title: "Data Analytics", progress: 30, status: "In Progress" },
    { title: "Software Engineering", progress: 65, status: "In Progress" },
    { title: "Artificial Intelligence", progress: 10, status: "In Progress" },
    { title: "Blockchain Technology", progress: 20, status: "In Progress" },
    { title: "Web development", progress: 85, status: "In Progress" },
    { title: "advanced Digital Marketing", progress: 100, status: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black">Welcome Back, Student! 👋</h1>
          <p className="text-gray-500">Continue your learning journey today.</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white">
            <BookOpen className="mb-4 opacity-80" />
            <p className="text-3xl font-bold">{myCourses.length}</p>
            <p className="opacity-80">Courses Enrolled</p>
          </div>
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white">
            <Trophy className="mb-4 opacity-80" />
            <p className="text-3xl font-bold">1</p>
            <p className="opacity-80">Certificates Earned</p>
          </div>
          <div className="bg-emerald-600 p-6 rounded-[2rem] text-white">
            <CheckCircle className="mb-4 opacity-80" />
            <p className="text-3xl font-bold">85%</p>
            <p className="opacity-80">Average Score</p>
          </div>
        </div>

        {/* My Courses */}
        <h2 className="text-2xl font-black mb-6">My Courses</h2>
        <div className="grid gap-6">
          {myCourses.map((course, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm"
            >
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">{course.title}</h4>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${course.progress === 100 ? "bg-green-500" : "bg-blue-600"} h-full transition-all duration-500`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-10 text-right">
                <span
                  className={`text-sm font-bold ${course.progress === 100 ? "text-green-600" : "text-blue-600"}`}
                >
                  {course.progress}% Complete
                </span>
                <button className="block mt-2 px-6 py-2 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  {course.progress === 100 ? "Review" : "Resume"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LMSDashboard;
