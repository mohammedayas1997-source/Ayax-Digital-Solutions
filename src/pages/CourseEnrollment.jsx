import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  GraduationCap,
  Globe,
  Camera,
  ArrowRight,
  Plus,
  Trash2,
  X,
  Lock,
  Loader2,
  BookOpen,
  User,
  MapPin,
  Download,
  CreditCard,
  School,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const secondarySubjects = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Geography",
  "Agricultural Science",
  "Civic Education",
  "Further Mathematics",
  "Literature in English",
  "Government",
  "History",
  "CRS",
  "IRS",
  "Hausa",
  "Igbo",
  "Yoruba",
  "French",
  "Commerce",
  "Financial Accounting",
  "Technical Drawing",
  "Data Processing",
  "Computer Studies",
  "Food & Nutrition",
  "Home Management",
  "Animal Husbandry",
  "Marketing",
  "Insurance",
  "Office Practice",
];

const CourseEnrollment = () => {
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const formRef = useRef();

  const [step, setStep] = useState("form"); // form, payment, success
  const [loading, setLoading] = useState(false);
  const [portalOpen, setPortalOpen] = useState(true);
  const [applicationId, setApplicationId] = useState(null);

  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

  const [oLevelResults, setOLevelResults] = useState(
    Array(9)
      .fill(null)
      .map((_, i) => ({ id: i, subject: "", grade: "" })),
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    stateOfOrigin: "",
    lgaOfOrigin: "",
    currentState: "",
    currentLGA: "",
    address: "",
    course: "",
    highestQualification: "",
    institutionName: "",
    courseStudied: "",
    yearOfGraduation: "",
    examNumber: "",
    centerNumber: "",
  });

  const PAYSTACK_PUBLIC_KEY =
    "sk_live_f200ced4764166f94755c529b6d421af3d34d2e0";

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "system_settings", "portal_control"),
      (docSnap) => {
        if (docSnap.exists()) setPortalOpen(docSnap.data().isOpen);
      },
    );
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setPassportImage(file);
      setPassportPreview(URL.createObjectURL(file));
    } else if (file) alert("File too large! Max 2MB allowed.");
  };

  const handleSubjectChange = (id, field, value) => {
    setOLevelResults((prev) =>
      prev.map((res) => (res.id === id ? { ...res, [field]: value } : res)),
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!portalOpen) return alert("Portal Locked.");
    if (!passportImage) return alert("Upload Passport First.");

    setLoading(true);
    try {
      // Assemble data and move to payment step
      setStep("payment");
    } catch (error) {
      alert("Error processing form");
    } finally {
      setLoading(false);
    }
  };

  const triggerPaystack = () => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: formData.email,
      amount: 100 * 100, // ₦100
      currency: "NGN",
      callback: (response) => {
        setLoading(true);
        processFinalSubmission(response.reference);
      },
      onClose: () => alert("Transaction Cancelled."),
    });
    handler.openIframe();
  };

  const processFinalSubmission = async (refId) => {
    try {
      let passportURL = "";
      if (passportImage) {
        const passportRef = ref(
          storage,
          `passports/${Date.now()}_${formData.name}`,
        );
        const pSnapshot = await uploadBytes(passportRef, passportImage);
        passportURL = await getDownloadURL(pSnapshot.ref);
      }

      const finalRecord = {
        ...formData,
        studentName: formData.get("name"), // Wannan zai dauko sunan dalibi
        studentEmail: formData.get("email"),
        amountPaid: "₦100", // Wannan zai fito a receipt
        passportUrl: passportURL,
        oLevelResults,
        transactionRef: refId,
        paymentStatus: "Verified",
        appliedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "course_applications"),
        finalRecord,
      );
      setApplicationId(docRef.id);

      // Email Automation
      emailjs.send(
        "service_2wusktt",
        "template_lfz7bfj",
        {
          fullName: formData.name,
          course: formData.course,
          email: formData.email,
        },
        "Zq65aNb8G1g9F7XkY",
      );

      setLoading(false);
      setStep("success");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    const element = receiptRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      210,
      (canvas.height * 210) / canvas.width,
    );
    pdf.save(`AYAX-RECEIPT-${formData.name}.pdf`);
  };

  if (!portalOpen) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center">
          <Lock size={80} className="mx-auto text-red-600 mb-6" />
          <h1 className="text-3xl font-black text-[#002147] uppercase">
            Portal Locked
          </h1>
          <button
            onClick={() => navigate("/")}
            className="mt-8 px-8 py-3 bg-[#002147] text-white rounded-xl font-bold"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden">
          <div className="bg-[#002147] p-10 text-center text-white">
            <CreditCard size={60} className="mx-auto mb-4 text-emerald-400" />
            <h2 className="text-2xl font-black uppercase">Enrollment Fee</h2>
          </div>
          <div className="p-10 text-center">
            <span className="text-6xl font-black text-[#002147]">₦100</span>
            <button
              onClick={triggerPaystack}
              className="w-full mt-8 bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase shadow-xl hover:bg-[#002147] transition-all flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Pay & Verify Now"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-6">
        <div
          ref={receiptRef}
          className="w-[180mm] bg-white p-10 shadow-2xl border-[12px] border-[#002147] mb-6 relative text-left"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white flex items-center justify-center border-2 border-slate-100 p-1">
                <GraduationCap size={40} className="text-[#002147]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#002147]">
                  AYAX ACADEMY
                </h1>
                <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">
                  Digital Solutions & Tech Academy
                </p>
              </div>
            </div>
            <QRCodeSVG value={applicationId || "Verified"} size={80} />
          </div>
          <div className="flex gap-8 border-y-2 py-6">
            <img
              src={passportPreview}
              className="w-32 h-40 object-cover rounded-lg border-2 border-slate-200"
              alt="Passport"
            />
            <div className="space-y-2 w-full">
              <p className="text-xs font-black uppercase text-slate-400">
                Student Name
              </p>
              <p className="text-xl font-black text-[#002147] uppercase">
                {formData.name}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4 text-left">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Course
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {formData.course}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Fee Paid
                  </p>
                  <p className="text-xs font-black text-emerald-600">₦100.00</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Application ID
                  </p>
                  <p className="text-[10px] font-bold">
                    {applicationId?.substr(0, 12)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Status
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600">
                    SUCCESSFUL
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold">
            Official Digital Enrollment Receipt - {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={downloadReceipt}
            className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black flex items-center gap-2 shadow-lg"
          >
            <Download size={20} /> DOWNLOAD PDF
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#002147] text-white px-10 py-4 rounded-xl font-black shadow-lg"
          >
            FINISH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-16 px-4 font-sans text-left">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-100">
        <div className="bg-[#002147] p-12 text-white flex justify-between items-center relative">
          <div className="z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <School size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                Enrollment Form
              </h1>
              <p className="text-red-500 font-black mt-2 uppercase text-[10px] tracking-[0.3em]">
                Ayax Digital Solutions Academy
              </p>
            </div>
          </div>
          <GraduationCap size={100} className="opacity-10 absolute right-10" />
        </div>

        <form onSubmit={handleFormSubmit} className="p-10 md:p-16 space-y-12">
          <section className="space-y-8 text-left">
            <div className="flex items-center gap-4 border-b pb-4">
              <User className="text-red-600" />
              <h2 className="text-[#002147] text-xl font-black uppercase">
                Candidate Profile
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center">
                <div className="w-44 h-52 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] relative flex items-center justify-center overflow-hidden hover:border-blue-500 transition-all">
                  {passportPreview ? (
                    <img
                      src={passportPreview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="mx-auto text-slate-300 mb-2" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        Upload Passport
                      </span>
                    </div>
                  )}
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  required
                  name="name"
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="sky-input"
                />
                <input
                  required
                  name="email"
                  type="email"
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="sky-input"
                />
                <input
                  required
                  name="phone"
                  type="tel"
                  onChange={handleChange}
                  placeholder="WhatsApp Number"
                  className="sky-input"
                />
                <select
                  required
                  name="gender"
                  onChange={handleChange}
                  className="sky-input"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                <input
                  required
                  name="stateOfOrigin"
                  onChange={handleChange}
                  placeholder="State of Origin"
                  className="sky-input"
                />
                <input
                  required
                  name="lgaOfOrigin"
                  onChange={handleChange}
                  placeholder="LGA of Origin"
                  className="sky-input"
                />
              </div>
            </div>
          </section>

          <section className="space-y-8 text-left">
            <div className="flex items-center gap-4 border-b pb-4">
              <MapPin className="text-blue-600" />
              <h2 className="text-[#002147] text-xl font-black uppercase">
                Residential Info
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                required
                name="currentState"
                onChange={handleChange}
                placeholder="State of Residence"
                className="sky-input"
              />
              <input
                required
                name="currentLGA"
                onChange={handleChange}
                placeholder="LGA of Residence"
                className="sky-input"
              />
              <textarea
                required
                name="address"
                onChange={handleChange}
                placeholder="Full Street Address"
                className="sky-input md:col-span-2"
                rows="2"
              />
            </div>
          </section>

          <section className="space-y-8 bg-slate-50 p-8 rounded-[2rem] text-left">
            <div className="flex items-center gap-4 border-b pb-4">
              <School className="text-emerald-600" />
              <h2 className="text-[#002147] text-xl font-black uppercase">
                Academic Background
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                required
                name="highestQualification"
                onChange={handleChange}
                className="sky-input"
              >
                <option value="">Highest Qualification</option>
                <option>Degree</option>
                <option>HND</option>
                <option>ND</option>
                <option>NCE</option>
                <option>SSCE Only</option>
              </select>
              <input
                required
                name="institutionName"
                onChange={handleChange}
                placeholder="Institution Name"
                className="sky-input"
              />
              <input
                required
                name="courseStudied"
                onChange={handleChange}
                placeholder="Course Studied"
                className="sky-input"
              />
              <input
                required
                name="yearOfGraduation"
                onChange={handleChange}
                placeholder="Year of Graduation"
                className="sky-input"
              />
            </div>
          </section>

          <section className="space-y-8 text-left">
            <div className="flex items-center gap-4 border-b pb-4">
              <BookOpen className="text-red-600" />
              <h2 className="text-[#002147] text-xl font-black uppercase">
                O-Level Results
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
              <input
                required
                name="examNumber"
                onChange={handleChange}
                placeholder="Exam Number"
                className="sky-input"
              />
              <input
                required
                name="centerNumber"
                onChange={handleChange}
                placeholder="Center Number"
                className="sky-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {oLevelResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-5 rounded-[1.5rem] border-2 border-slate-100 flex flex-col gap-3 shadow-sm"
                >
                  <select
                    required
                    className="sky-input !p-2 !text-xs"
                    onChange={(e) =>
                      handleSubjectChange(res.id, "subject", e.target.value)
                    }
                  >
                    <option value="">Select Subject</option>
                    {secondarySubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="sky-input !p-2 !text-xs"
                    onChange={(e) =>
                      handleSubjectChange(res.id, "grade", e.target.value)
                    }
                  >
                    <option value="">Grade</option>
                    {["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#002147] p-8 rounded-[2rem] text-white">
            <label className="text-xs font-black uppercase mb-4 block">
              Select Specialization
            </label>
            <select
              required
              name="course"
              onChange={handleChange}
              className="w-full p-5 rounded-2xl bg-white text-[#002147] font-black outline-none"
            >
              <option value="">Choose Course...</option>
              <option>Cyber security</option>
              <option>Data Analytics</option>
              <option>Software Engineering</option>
              <option>Artificial Intelligence</option>
              <option>Blockchain Technology</option>
              <option>Web development</option>
              <option>Advanced Digital Marketing</option>
            </select>
          </section>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-red-600 text-white font-black py-8 rounded-[2.5rem] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#002147] transition-all flex items-center justify-center gap-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Verify & Proceed to Payment"
            )}
          </button>
        </form>
      </div>

      <style>{`
        .sky-input {
          width: 100%;
          padding: 1.2rem 1.5rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 1.2rem;
          font-weight: 700;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s ease;
          color: #0f172a;
        }
        .sky-input:focus {
          border-color: #002147;
          background: white;
          box-shadow: 0 10px 15px -3px rgba(0, 33, 71, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;
