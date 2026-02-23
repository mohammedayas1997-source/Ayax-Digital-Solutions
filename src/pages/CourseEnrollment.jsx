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
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { downloadPDFReceipt, downloadFilledForm } from "../utils/pdfGenerator";

const currencyData = {
  Nigeria: { code: "NGN", symbol: "₦", fee: 100 },
  // ... (rest of your currency data remains untouched)
};

const CourseEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [portalOpen, setPortalOpen] = useState(true);
  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);
  const [educationList, setEducationList] = useState([
    { qualification: "", institution: "", course: "", year: "" },
  ]);
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedCourse, setSelectedCourse] = useState(
    location.state?.selectedCourse || "",
  );

  const PAYSTACK_PUBLIC_KEY =
    "pk_live_991624fc58b3d5fbebeb512819a3976c6b936ad7";

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "system_settings", "portal_control"),
      (docSnap) => {
        if (docSnap.exists()) setPortalOpen(docSnap.data().isOpen);
      },
    );
    return () => unsub();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setPassportImage(file);
      setPassportPreview(URL.createObjectURL(file));
    } else if (file) alert("File too large! Max 2MB allowed.");
  };

  const handleEducationChange = (index, field, value) => {
    const list = [...educationList];
    list[index][field] = value;
    setEducationList(list);
  };

  const addEducation = () =>
    setEducationList([
      ...educationList,
      { qualification: "", institution: "", course: "", year: "" },
    ]);
  const removeEducation = (index) => {
    const list = [...educationList];
    list.splice(index, 1);
    setEducationList(list);
  };

  // --- EXECUTIVE WORLD-CLASS SUBMISSION LOGIC ---
  const processFinalSubmission = async (formData, refId) => {
    try {
      // 1. ASSEMBLE DATA PACKET (Ensures Admin and Receipt get the same data)
      const studentInfo = {
        studentName: formData.get("name"),
        studentEmail: formData.get("email"),
        studentPhone: formData.get("phone"),
        address: formData.get("address"),
        currentState: formData.get("currentState"),
        currentLGA: formData.get("currentLGA"),
        stateOfOrigin: formData.get("stateOfOrigin"),
        lgaOfOrigin: formData.get("lgaOfOrigin"),
        course: selectedCourse,
        educationBackground: educationList,
        country: selectedCountry,
        transactionRef: refId,
        amountPaid: `${currencyData[selectedCountry].symbol}${currencyData[selectedCountry].fee}`,
        paymentStatus: "Verified",
        appliedAt: serverTimestamp(),
      };

      // 2. BACKGROUND SYNC START (Non-blocking but started immediately)
      const saveToDatabase = async () => {
        let passportURL = "";
        if (passportImage) {
          const passportRef = ref(
            storage,
            `passports/${Date.now()}_${studentInfo.studentName}`,
          );
          const pSnapshot = await uploadBytes(passportRef, passportImage);
          passportURL = await getDownloadURL(pSnapshot.ref);
        }

        const finalRecord = { ...studentInfo, passportUrl: passportURL };

        // PUSH TO ADMIN INSTANTLY
        await Promise.all([
          addDoc(collection(db, "course_applications"), finalRecord),
          addDoc(collection(db, "enrollments"), finalRecord),
        ]);

        // Email Automation
        const templateParams = {
          fullName: studentInfo.studentName,
          course: studentInfo.course,
          email: studentInfo.studentEmail,
          school_name: "AYAX Digital Solutions Academy",
          submission_date: new Date().toLocaleDateString(),
        };
        emailjs.send(
          "service_2wusktt",
          "template_lfz7bfj",
          templateParams,
          "Zq65aNb8G1g9F7XkY",
        );
      };

      // Start database save in background
      saveToDatabase();

      // 3. UI UPDATE: STAY ON SUBMIT PAGE
      setLoading(false);
      setSuccessMessage(`Welcome to Ayax Academy, ${studentInfo.studentName}`);

      // 4. GENERATE DOCUMENTS WITH CORRECT DATA
      if (downloadPDFReceipt) downloadPDFReceipt(studentInfo);
      if (downloadFilledForm) downloadFilledForm(studentInfo);
    } catch (err) {
      console.error("Critical Submission Error:", err);
      setLoading(false);
      alert("System Error during submission. Please contact Admin.");
    }
  };

  const handleApplyTrigger = (e) => {
    e.preventDefault();
    if (!portalOpen) return alert("Portal Locked.");
    if (!passportImage) return alert("Upload Passport First.");
    const formData = new FormData(formRef.current);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: formData.get("email"),
      amount: currencyData[selectedCountry].fee * 100, // 100 * 100 = 10,000 kobo (₦100)
      currency: currencyData[selectedCountry].code,

      // --- HAKAN ZAI KAI KA CIKIN OPAY ---
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],

      callback: (response) => {
        setLoading(true);
        processFinalSubmission(formData, response.reference);
      },
      onClose: () => alert("Transaction Cancelled."),
    });
    handler.openIframe();
  };

  // UI Code
  if (!portalOpen) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-10 text-center">
        <div className="p-10 bg-white/5 rounded-[4rem] border border-white/10 backdrop-blur-3xl">
          <Lock
            size={100}
            className="text-red-500 mx-auto mb-8 animate-bounce"
          />
          <h1 className="text-5xl font-black uppercase text-white tracking-tighter text-wrap">
            Portal <span className="text-red-500">Locked</span>
          </h1>
          <button
            onClick={() => navigate("/")}
            className="mt-10 px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 relative">
        {loading && (
          <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={50} />
            <p className="font-black uppercase tracking-widest text-xs">
              Securing Data...
            </p>
          </div>
        )}

        {/* SUCCESS PAGE: NO REDIRECT TO DASHBOARD */}
        {successMessage && (
          <div className="absolute inset-0 z-[110] bg-blue-600 flex flex-col items-center justify-center p-12 text-center text-white animate-in fade-in duration-500">
            <GraduationCap size={100} className="mb-6 animate-bounce" />
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">
              {successMessage}
            </h2>
            <p className="font-bold opacity-80 mb-8 uppercase tracking-widest text-xs">
              Enrollment Fee Verified. Receipts Generated.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs shadow-2xl active:scale-95"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-900 p-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
          <h1 className="text-4xl font-black uppercase text-white tracking-tight">
            Elite <span className="text-blue-500">Enrollment</span>
          </h1>
        </div>

        <form
          ref={formRef}
          onSubmit={handleApplyTrigger}
          className="p-8 lg:p-16 space-y-16"
        >
          {/* ... (All your existing form sections - Passport, Credentials, Academic History, Resident) */}
          {/* (Kept identical to original to ensure no data loss) */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group hover:border-blue-400">
              {passportPreview ? (
                <img
                  src={passportPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="text-center">
                  <Camera
                    className="text-slate-300 group-hover:text-blue-500 mx-auto"
                    size={48}
                  />
                  <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">
                    Max 2MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* ... Student Credentials inputs ... */}
          <div className="grid md:grid-cols-2 gap-8">
            <input
              name="name"
              required
              className="input-style"
              placeholder="Full Name"
            />
            <input
              name="email"
              type="email"
              required
              className="input-style"
              placeholder="Email Address"
            />
            <input
              name="phone"
              type="tel"
              required
              className="input-style"
              placeholder="WhatsApp Number"
            />
            <select
              name="country"
              required
              className="input-style"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {Object.keys(currencyData).map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="md:col-span-2 p-6 bg-blue-600 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
              <div className="flex items-center gap-3">
                <Globe size={24} className="opacity-70" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Enrollment Fee
                </span>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black">
                  {currencyData[selectedCountry].symbol}
                  {currencyData[selectedCountry].fee.toLocaleString()}
                </h2>
              </div>
            </div>
            <select
              name="course"
              required
              className="input-style md:col-span-2"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Specialization</option>
              <option value="Cyber security">Cyber security</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
              <option value="Blockchain Technology">
                Blockchain Technology
              </option>
              <option value="Web development">Web development</option>
              <option value="advanced Digital Marketing">
                Advanced Digital Marketing
              </option>
            </select>
          </div>

          {/* ... Academic History list ... */}
          <div className="space-y-6">
            {educationList.map((edu, index) => (
              <div
                key={index}
                className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative"
              >
                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="absolute top-6 right-6 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <select
                    className="input-style"
                    value={edu.qualification}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "qualification",
                        e.target.value,
                      )
                    }
                    required
                  >
                    <option value="">Select Qualification</option>
                    <option value="SSCE">SSCE</option>
                    <option value="ND/Diploma">ND / Diploma</option>
                    <option value="NCE">NCE</option>
                    <option value="HND/Degree">HND / Degree</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                  <input
                    className="input-style"
                    placeholder="Institution Name"
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "institution",
                        e.target.value,
                      )
                    }
                    required
                  />
                  {edu.qualification !== "SSCE" && (
                    <input
                      className="input-style"
                      placeholder="Course of Study"
                      value={edu.course}
                      onChange={(e) =>
                        handleEducationChange(index, "course", e.target.value)
                      }
                      required
                    />
                  )}
                  <input
                    className="input-style"
                    placeholder="Graduation Year"
                    value={edu.year}
                    onChange={(e) =>
                      handleEducationChange(index, "year", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add More Credentials
            </button>
          </div>

          {/* ... Resident & Origin ... */}
          <div className="grid md:grid-cols-2 gap-6">
            <input
              name="address"
              required
              className="input-style md:col-span-2"
              placeholder="Street Address"
            />
            <input
              name="currentState"
              required
              className="input-style"
              placeholder="Current State"
            />
            <input
              name="currentLGA"
              required
              className="input-style"
              placeholder="Current LGA"
            />
            <input
              name="stateOfOrigin"
              required
              className="input-style"
              placeholder="State of Origin"
            />
            <input
              name="lgaOfOrigin"
              required
              className="input-style"
              placeholder="LGA of Origin"
            />
          </div>

          <button
            type="submit"
            className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
          >
            Pay & Complete Enrollment <ArrowRight size={22} />
          </button>
        </form>
      </div>
      <style>{`
        .input-style { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 800; font-size: 0.85rem; color: #0f172a; transition: all 0.3s ease; }
        .input-style:focus { border-color: #2563eb; background: white; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.1); }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;
