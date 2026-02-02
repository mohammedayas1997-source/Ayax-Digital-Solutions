import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Integrated Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send, CheckCircle2, User, Mail, MessageSquare, Layers, Rocket } from 'lucide-react';

const ProjectForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // State to hold form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tier: 'School - Basic (₦150k)',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Saving to Firebase 'inquiries' collection
      await addDoc(collection(db, "inquiries"), {
        fullName: formData.name,
        email: formData.email,
        serviceTier: formData.tier,
        message: formData.message,
        status: 'Pending',
        adminResponse: '', // Ready for your response from Admin Dashboard
        createdAt: serverTimestamp()
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending inquiry: ", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-black mb-4">Inquiry Received!</h2>
        <p className="text-gray-600 text-lg">
          The AYAX Digital team has been notified. We will review your project requirements and get back to you within 24 hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-blue-600 font-bold hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <section id="contact" className="py-24 bg-gray-50 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Start Your Digital Journey</h2>
          <p className="text-gray-600">Fill out the form below and let’s build something extraordinary together.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Info */}
          <div className="md:w-1/3 bg-blue-600 p-10 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Info</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="w-5 h-5 text-blue-200" />
                  <p className="text-sm">projects@ayaxdigital.com</p>
                </div>
                <div className="flex gap-4">
                  <Rocket className="w-5 h-5 text-blue-200" />
                  <p className="text-sm">Global Remote Support Available</p>
                </div>
              </div>
            </div>
            <div className="mt-12 bg-blue-700/50 p-6 rounded-2xl border border-blue-400/30">
              <p className="text-xs uppercase tracking-widest font-bold mb-2 opacity-70">Quick Note</p>
              <p className="text-sm italic text-blue-50">"Quality is never an accident; it is always the result of intelligent effort."</p>
            </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="md:w-2/3 p-10 lg:p-16 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" /> Email Address
                </label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" /> Select Service Tier
              </label>
              <select 
                value={formData.tier}
                onChange={(e) => setFormData({...formData, tier: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <optgroup label="School Management">
                  <option>School - Basic (₦150k)</option>
                  <option>School - Professional (₦450k)</option>
                  <option>School - Global Campus (₦1.2m+)</option>
                </optgroup>
                <optgroup label="Fintech & Apps">
                  <option>Data/VTU - Starter (₦180k)</option>
                  <option>Data/VTU - Pro (₦500k)</option>
                  <option>Fintech - Banking Level (₦1.5m+)</option>
                </optgroup>
                <optgroup label="Other Solutions">
                  <option>Hospital Management System</option>
                  <option>Government E-Portal</option>
                  <option>Custom NGO/Foundation Website</option>
                </optgroup>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Project Details
              </label>
              <textarea 
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Tell us more about your project goals..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Inquiry"} <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProjectForm;