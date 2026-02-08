import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Megaphone,
  ShieldAlert,
  BarChart3,
  ArrowUpRight,
  Users,
  Timer,
  Trophy,
  CheckCircle2,
  Banknote,
  Cpu,
  Database,
  Globe,
} from "lucide-react";

const CourseSection = () => {
  const navigate = useNavigate();

  const courses = [
    {
      title: "Web development",
      description:
        "Master the art of building scalable web applications from database architecture to premium frontend interfaces.",
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      image:
        "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "30,000 Naira",
      level: "Beginner to Pro",
      accent: "blue",
    },
    {
      title: "advanced Digital Marketing",
      description:
        "Go beyond basic ads. Learn algorithmic targeting, conversion optimization, and strategic brand dominance.",
      icon: <Megaphone className="w-8 h-8 text-emerald-500" />,
      image:
        "https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "30,000 Naira",
      level: "Intermediate",
      accent: "emerald",
    },
    {
      title: "Cyber security",
      description:
        "Deep dive into ethical hacking, network defense, and protecting enterprise infrastructure from global threats.",
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      image:
        "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "30,000 Naira",
      level: "Advanced",
      accent: "red",
    },
    {
      title: "Data Analytics",
      description:
        "Transform raw numbers into strategic power. Master Python, SQL, and AI-driven predictive modeling.",
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      image:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "30,000 Naira",
      level: "Professional",
      accent: "purple",
    },
    {
      title: "Software Engineering",
      description:
        "Build robust systems and learn the full software development lifecycle from design to deployment.",
      icon: <Code2 className="w-8 h-8 text-indigo-500" />,
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "30,000 Naira",
      level: "Professional",
      accent: "indigo",
    },
    {
      title: "Artificial Intelligence",
      description:
        "Explore the future of tech. Learn machine learning, neural networks, and how to build intelligent systems.",
      icon: <Cpu className="w-8 h-8 text-orange-500" />,
      image:
        "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "40,000 Naira",
      level: "Professional",
      accent: "orange",
    },
    {
      title: "Blockchain Technology",
      description:
        "Understand decentralization, smart contracts, and Web3 technologies that are redefining digital trust.",
      icon: <Database className="w-8 h-8 text-cyan-500" />,
      image:
        "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "35,000 Naira",
      level: "Professional",
      accent: "cyan",
    },
  ];

  const handleEnrollClick = (courseTitle) => {
    navigate("/enroll", { state: { selectedCourse: courseTitle } });
  };

  return (
    <section className="py-32 bg-[#f8fafc] px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl text-left">
            <h4 className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-4">
              Ayax Academy
            </h4>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic">
              Forge Your <span className="text-blue-600">Legacy</span>
            </h2>
            <p className="text-gray-500 mt-6 text-lg font-medium leading-relaxed">
              Industrial-grade training designed to transform students into
              elite tech architects.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <Trophy className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Certified
                </p>
                <p className="text-sm font-bold text-gray-900">
                  Industry Expert
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30">
                    {course.level}
                  </span>
                  <div className="p-3 bg-white rounded-2xl shadow-xl transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                    {course.icon}
                  </div>
                </div>
              </div>

              <div className="p-8 text-left">
                <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Timer className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {course.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-900">
                    <Banknote className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      {course.fees}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Live Projects Included
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleEnrollClick(course.title)}
                  className="w-full group/btn relative py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-blue-600 shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Enroll Now{" "}
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-wrap justify-center items-center gap-12">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] w-full text-center mb-4">
            Trusted by modern innovators
          </p>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-4 border-[#f8fafc] bg-gray-200 overflow-hidden"
              >
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="student" />
              </div>
            ))}
          </div>
          <p className="text-gray-500 font-bold text-sm">
            Join <span className="text-gray-900">500+</span> Elite Tech Students
          </p>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
