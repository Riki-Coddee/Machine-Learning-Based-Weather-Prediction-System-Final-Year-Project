import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Globe, BrainCircuit } from "lucide-react";
import { useRef, useState } from "react";
import emailjs from '@emailjs/browser';
import {toast} from "react-toastify";
const ContactUs = () => {
  const formRef = useRef();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. First send email via EmailJS
      await emailjs.send(
        'service_rikesh',
        'template_4iry5ux',
        {
          from_name: form.name,
          to_name: "RainCheck Team",
          from_email: form.email,
          to_email: "rikeshshrestha9821@gmail.com",
          message: form.message,
        },
        'GLOTVWKVVqI1-BCVw'
      );

      // 2. Then store in our database
      const response = await fetch('http://localhost:5000/api/admin/add/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to store feedback');
      }

      // Success handling
      setIsLoading(false);
      setIsSent(true);
       toast.success( "Message sent successfully! We'll get back to you soon.");
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setIsSent(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      // Still show success to user even if storage failed (email still sent)
      setIsSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setIsSent(false), 3000);
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut",
        },
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <motion.div 
          className="absolute top-1/4 left-10% w-20 h-20 bg-blue-500 rounded-full filter blur-xl"
          variants={floatingVariants}
          animate="float"
        />
        <motion.div 
          className="absolute top-2/3 right-15% w-32 h-32 bg-indigo-600 rounded-full filter blur-xl"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 0.5 }}
        />
        <motion.div 
          className="absolute top-1/3 right-25% w-16 h-16 bg-cyan-400 rounded-full filter blur-xl"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1 }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Connect
            </span>{" "}
            With Our AI Weather Team
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Have questions about our rainfall prediction algorithms? Want to collaborate? 
            Our team of machine learning meteorologists is ready to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700"
          >
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <BrainCircuit className="text-cyan-400" />
              AI-Powered Inquiry System
            </h2>
            
            {isSent ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-green-900 bg-opacity-50 p-6 rounded-xl text-center"
              >
                <div className="text-2xl text-green-400 font-bold mb-2">Message Sent!</div>
                <p className="text-green-200">Our weather AI will analyze your request and respond within 24 hours.</p>
              </motion.div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-blue-200 mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-blue-200 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-blue-200 mb-2">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400"
                    placeholder="Tell us about your weather prediction needs..."
                  />
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    'Analyzing Your Message...'
                  ) : (
                    <>
                      <Send size={20} />
                      Send Weather Inquiry
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPin className="text-red-400" />
                Meteorological Headquarters
              </h3>
              <p className="text-blue-200 mb-6">
                Prime College<br />
                BCA Department, 6th Semester Project<br />
                Kathmandu, Nepal
              </p>
              <div className="h-64 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.456715477861!2d85.32501531506205!3d27.703899382793915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1908434cb3c7%3A0x1fdf2a4d5e2d5f9e!2sPrime%20College!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="text-cyan-400" />
                  <h4 className="text-xl font-bold text-white">Email Us</h4>
                </div>
                <p className="text-blue-200">contact@raincheck.ai</p>
                <p className="text-blue-200">rikeshshrestha@gmail.com</p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="text-green-400" />
                  <h4 className="text-xl font-bold text-white">Call Us</h4>
                </div>
                <p className="text-blue-200">+977 9841879297</p>
                <p className="text-blue-200">Support: 24/7 AI Assistant</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-cyan-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-white" />
                <h4 className="text-xl font-bold text-white">Project Links</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="px-4 py-2 bg-white bg-opacity-10 rounded-lg text-black hover:bg-opacity-20 transition">
                  GitHub Repo
                </a>
                <a href="#" className="px-4 py-2 bg-white bg-opacity-10 rounded-lg text-black hover:bg-opacity-20 transition">
                  Research Paper
                </a>
                <a href="#" className="px-4 py-2 bg-white bg-opacity-10 rounded-lg text-black hover:bg-opacity-20 transition">
                  Live Demo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;