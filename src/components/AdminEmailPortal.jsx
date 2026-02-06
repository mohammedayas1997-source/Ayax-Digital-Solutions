import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  Send,
  Mail,
  Users,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

const AdminEmailPortal = () => {
  const [recipients, setRecipients] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState({
    to_name: "",
    to_email: "",
    message: "",
    subject: "",
  });

  // Fetch all users from Firestore to populate the recipient list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecipients(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Handle user selection from dropdown
  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    const user = recipients.find((u) => u.id === userId);
    if (user) {
      setEmailData({
        ...emailData,
        to_name: user.fullName || user.username || "Valued Client",
        to_email: user.email,
      });
    }
  };

  // Main function to send the email via EmailJS
  const sendEmail = (e) => {
    e.preventDefault();
    if (!emailData.to_email) {
      alert("Error: Please select a valid recipient from the list.");
      return;
    }

    setIsSending(true);

    // Your verified credentials
    const serviceId = "service_2wusktt";
    const templateId = "template_52e21uo";
    const publicKey = "Zq65aNb8G1g9F7XkY";

    emailjs
      .send(serviceId, templateId, emailData, publicKey)
      .then(() => {
        alert("SUCCESS: Message dispatched to " + emailData.to_email);
        // Reset form fields
        setEmailData({ ...emailData, message: "", subject: "" });
        setSelectedUser("");
      })
      .catch((err) => {
        alert(
          "CRITICAL ERROR: Failed to send email. Please verify EmailJS service status.",
        );
        console.error("EmailJS Error:", err);
      })
      .finally(() => setIsSending(false));
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Mail size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Ayax Mail Engine
            </h2>
            <div className="flex items-center gap-2 text-blue-600 mt-1">
              <ShieldCheck size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Secure Admin Communications
              </p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Authorized Sender
          </p>
          <p className="text-sm font-bold text-slate-700">
            ayaxdigitalsolutions@gmail.com
          </p>
        </div>
      </div>

      <form onSubmit={sendEmail} className="space-y-8">
        {/* Recipient Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 ml-2">
              Database Recipient
            </label>
            <select
              className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all appearance-none shadow-inner"
              onChange={handleUserSelect}
              value={selectedUser}
              required
            >
              <option value="">Select User from List</option>
              {recipients.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.username} — ({user.role || "Member"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 ml-2">
              Destination Address
            </label>
            <input
              type="email"
              className="w-full p-5 bg-slate-100 rounded-2xl border-none outline-none font-bold text-slate-400 cursor-not-allowed shadow-inner"
              value={emailData.to_email}
              readOnly
              placeholder="Email Auto-filled"
            />
          </div>
        </div>

        {/* Subject Input */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-500 ml-2">
            Subject Line
          </label>
          <input
            type="text"
            placeholder="e.g., Admission Approval / Service Maintenance Notice"
            className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-black text-slate-800 transition-all shadow-inner"
            onChange={(e) =>
              setEmailData({ ...emailData, subject: e.target.value })
            }
            value={emailData.subject}
            required
          />
        </div>

        {/* Message Input */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-500 ml-2">
            Message Body
          </label>
          <textarea
            placeholder="Draft your professional correspondence here..."
            className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none h-60 resize-none text-slate-700 leading-relaxed font-medium transition-all shadow-inner"
            onChange={(e) =>
              setEmailData({ ...emailData, message: e.target.value })
            }
            value={emailData.message}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          disabled={isSending}
          className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 transition-all shadow-2xl ${
            isSending
              ? "bg-slate-200 text-slate-400 cursor-wait"
              : "bg-slate-900 text-white hover:bg-blue-600 hover:scale-[1.01] active:scale-[0.98]"
          }`}
        >
          {isSending ? (
            <>
              <Loader2 className="animate-spin" /> Transmitting...
            </>
          ) : (
            <>
              <Send size={20} /> Dispatch Official Mail
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminEmailPortal;
