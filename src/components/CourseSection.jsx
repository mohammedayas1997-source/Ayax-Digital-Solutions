import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; 
import { collection, query, where, getDocs } from "firebase/firestore";
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
  Fingerprint,
  Loader2,
  X,
  MapPin,
  DollarSign
} from "lucide-react";

// MULTI-CURRENCY DATA (USD + Africa 54)
const currencyData = {
  United_States: { code: "USD", symbol: "$", fee: 35 },
  Nigeria: { code: "NGN", symbol: "₦", fee: 50000 },
  Algeria: { code: "DZD", symbol: "DA", fee: 4550 },
  Angola: { code: "AOA", symbol: "Kz", fee: 28000 },
  Benin: { code: "XOF", symbol: "CFA", fee: 20500 },
  Botswana: { code: "BWP", symbol: "P", fee: 450 },
  Burkina_Faso: { code: "XOF", symbol: "CFA", fee: 20500 },
  Burundi: { code: "BIF", symbol: "FBu", fee: 96000 },
  Cameroon: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Cape_Verde: { code: "CVE", symbol: "Esc", fee: 3400 },
  Central_African_Republic: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Chad: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Comoros: { code: "KMF", symbol: "CF", fee: 15500 },
  Congo_DRC: { code: "CDF", symbol: "FC", fee: 94000 },
  Congo_Republic: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Djibouti: { code: "DJF", symbol: "Fdj", fee: 6000 },
  Egypt: { code: "EGP", symbol: "E£", fee: 1650 },
  Equatorial_Guinea: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Eritrea: { code: "ERN", symbol: "Nfk", fee: 500 },
  Eswatini: { code: "SZL", symbol: "L", fee: 650 },
  Ethiopia: { code: "ETB", symbol: "Br", fee: 3800 },
  Gabon: { code: "XAF", symbol: "FCFA", fee: 20500 },
  Gambia: { code: "GMD", symbol: "D", fee: 2300 },
  Ghana: { code: "GHS", symbol: "GH₵", fee: 500 },
  Guinea: { code: "GNF", symbol: "FG", fee: 290500 },
  Guinea_Bissau: { code: "XOF", symbol: "CFA", fee: 20500 },
  Ivory_Coast: { code: "XOF", symbol: "CFA", fee: 20500 },
  Kenya: { code: "KES", symbol: "KSh", fee: 4400 },
  Lesotho: { code: "LSL", symbol: "L", fee: 650 },
  Liberia: { code: "LRD", symbol: "L$", fee: 6500 },
  Libya: { code: "LYD", symbol: "LD", fee: 150 },
  Madagascar: { code: "MGA", symbol: "Ar", fee: 152500 },
  Malawi: { code: "MWK", symbol: "MK", fee: 57500 },
  Mali: { code: "XOF", symbol: "CFA", fee: 20500 },
  Mauritania: { code: "MRU", symbol: "UM", fee: 1350 },
  Mauritius: { code: "MUR", symbol: "₨", fee: 1550 },
  Morocco: { code: "MAD", symbol: "DH", fee: 350 },
  Mozambique: { code: "MZN", symbol: "MT", fee: 2150 },
  Namibia: { code: "NAD", symbol: "N$", fee: 650 },
  Niger: { code: "XOF", symbol: "CFA", fee: 20500 },
  Rwanda: { code: "RWF", symbol: "RF", fee: 43000 },
  Sao_Tome: { code: "STN", symbol: "Db", fee: 750 },
  Senegal: { code: "XOF", symbol: "CFA", fee: 20500 },
  Seychelles: { code: "SCR", symbol: "SR", fee: 450 },
  Sierra_Leone: { code: "SLE", symbol: "Le", fee: 750 },
  Somalia: { code: "SOS", symbol: "Sh", fee: 19000 },
  South_Africa: { code: "ZAR", symbol: "R", fee: 650 },
  South_Sudan: { code: "SSP", symbol: "£", fee: 44000 },
  Sudan: { code: "SDG", symbol: "£", fee: 20500 },
  Tanzania: { code: "TZS", symbol: "TSh", fee: 86000 },
  Togo: { code: "XOF", symbol: "CFA", fee: 20500 },
  Tunisia: { code: "TND", symbol: "DT", fee: 100 },
  Uganda: { code: "UGX", symbol: "USh", fee: 126500 },
  Zambia: { code: "ZMW", symbol: "ZK", fee: 900 },
  Zimbabwe: { code: "ZWG", symbol: "ZiG", fee: 4500 }
};

const CourseSection = () => {
  const navigate = useNavigate();
  const [showIdModal, setShowIdModal] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("United_States");

  const courses = [
    {
      title: "Web development",
      description: "Master the art of building scalable web applications from database architecture to premium frontend interfaces.",
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      image: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Beginner to Pro",
      accent: "blue",
    },
    {
      title: "advanced Digital Marketing",
      description: "Go beyond basic ads. Learn algorithmic targeting, conversion optimization, and strategic brand dominance.",
      icon: <Megaphone className="w-8 h-8 text-emerald-500" />,
      image: "https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Intermediate",
      accent: "emerald",
    },
    {
      title: "Cyber security",
      description: "Deep dive into ethical hacking, network defense, and protecting enterprise infrastructure from global threats.",
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      image: "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Advanced",
      accent: "red",
    },
    {
      title: "Data Analytics",
      description: "Transform raw numbers into strategic power. Master Python, SQL, and AI-driven predictive modeling.",
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Professional",
      accent: "purple",
    },
    {
      title: "Software Engineering",
      description: "Build robust systems and learn the full software development lifecycle from design to deployment.",
      icon: <Code2 className="w-8 h-8 text-indigo-500" />,
      image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Professional",
      accent: "indigo",
    },
    {
      title: "Artificial Intelligence",
      description: "Explore the future of tech. Learn machine learning, neural networks, and how to build intelligent systems.",
      icon: <Cpu className="w-8 h-8 text-orange-500" />,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Professional",
      accent: "orange",
    },
    {
      title: "Blockchain Technology",
      description: "Understand decentralization, smart contracts, and Web3 technologies that are redefining digital trust.",
      icon: <Database className="w-8 h-8 text-cyan-500" />,
      image: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600",
      duration: "6 Months",
      fees: "50,000 Naira",
      level: "Professional",
      accent: "cyan",
    },
  ];

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowIdModal(true);
  };

  const verifyIdAndProceed = async () => {
    if (!studentId.trim()) return alert("Please enter your Student ID");
    setIsVerifying(true);
    try {
      const q = query(collection(db, "course_applications"), where("studentId", "==", studentId.trim()), where("paymentStatus", "==", "Form_Paid"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data();
        const countryInfo = currencyData[selectedCountry];
        navigate("/tuition-payment", { state: { studentId, courseTitle: selectedCourse.title, studentName: studentData.studentName, country: selectedCountry, localAmount: `${countryInfo.symbol}${countryInfo.fee.toLocaleString()}`, amountInNaira: 50000 } });
      } else {
        alert("INVALID ID: Either the ID is incorrect or your Form Fee hasn't been verified.");
      }
    } catch (error) {
      alert("System Error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="py-32 bg-[#f8fafc] px-6">
      {showIdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative border border-gray-100">
            <button onClick={() => setShowIdModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            <div className="text-center mb-10">
              <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Fingerprint size={48} className="text-blue-600" /></div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic italic">Verify Identity</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 tracking-widest">Enter Credentials To Unlock Tuition Portal</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 flex items-center gap-2"><Globe size={12} /> Select Residence</label>
                <select className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none font-black text-sm" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                  {Object.keys(currencyData).map((c) => (<option key={c} value={c}>{c.replace("_", " ")}</option>))}
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Student Access ID</label>
                <input className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none font-black text-center text-xl tracking-[0.3em] uppercase" placeholder="AYX-XXX-XXX" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
              <div className="p-6 bg-slate-900 rounded-3xl text-white flex justify-between items-center shadow-xl">
                <div><p className="text-[9px] font-black opacity-50 uppercase tracking-widest">Global Tuition</p><h2 className="text-2xl font-black text-emerald-400">{currencyData[selectedCountry].symbol}{currencyData[selectedCountry].fee.toLocaleString()}</h2></div>
                <div className="bg-white/10 p-2 rounded-lg"><DollarSign size={20} className="text-emerald-400" /></div>
              </div>
              <button onClick={verifyIdAndProceed} disabled={isVerifying} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50">{isVerifying ? <Loader2 className="animate-spin" /> : <>Access Payment Portal <ArrowUpRight size={18} /></>}</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl text-left">
            <h4 className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-4">Ayax Academy</h4>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic">Forge Your <span className="text-blue-600">Legacy</span></h2>
            <p className="text-gray-500 mt-6 text-lg font-medium leading-relaxed">Industrial-grade training designed to transform students into elite tech architects.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full"><Trophy className="text-blue-600 w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-gray-400">Certified</p><p className="text-sm font-bold text-gray-900">Industry Expert</p></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <div key={index} className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl">
              <div className="h-64 relative overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30">{course.level}</span>
                  <div className="p-3 bg-white rounded-2xl shadow-xl transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500">{course.icon}</div>
                </div>
              </div>
              <div className="p-8 text-left">
                <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3">{course.description}</p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-gray-600"><Timer className="w-4 h-4 text-blue-500" /><span className="text-xs font-bold uppercase tracking-wider">{course.duration}</span></div>
                  <div className="flex items-center gap-3 text-gray-900"><Banknote className="w-4 h-4 text-amber-500" /><span className="text-xs font-black uppercase tracking-wider">{course.fees}</span></div>
                  <div className="flex items-center gap-3 text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold uppercase tracking-wider">Live Projects Included</span></div>
                </div>
                <button onClick={() => handleEnrollClick(course)} className="w-full group/btn relative py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-blue-600 shadow-lg"><span className="relative z-10 flex items-center justify-center gap-2">Tuition Access <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></span></button>
              </div>
            </div>
          ))}
        </div>

        {/* TRUSTED SECTION (DA NA GOGE DAZU) - GASHI NA DAWO DASHI */}
        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-wrap justify-center items-center gap-12">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] w-full text-center mb-4">Trusted by modern innovators</p>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#f8fafc] bg-gray-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="student" />
              </div>
            ))}
          </div>
          <p className="text-gray-500 font-bold text-sm">Join <span className="text-gray-900">500+</span> Elite Tech Students</p>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;