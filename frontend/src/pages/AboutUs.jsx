import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudSun, Database, Globe, Shield } from "lucide-react";
import IMG1 from '../images/Rikesh.jpg';
import IMG2 from '../images/CEO.jpeg';
import IMG3 from '../images/Manager.jpeg';

const AboutUs = () => {
  const features = [
    {
      icon: <CloudSun className="h-10 w-10 text-blue-600" />,
      title: "Accurate Predictions",
      description: "Our AI models analyze decades of weather patterns to deliver forecasts with 95% accuracy."
    },
    {
      icon: <Database className="h-10 w-10 text-blue-600" />,
      title: "Massive Data Processing",
      description: "Processing over 10TB of weather data daily from satellites, radars, and ground stations."
    },
    {
      icon: <Globe className="h-10 w-10 text-blue-600" />,
      title: "Global Coverage",
      description: "Providing hyper-local forecasts for any location worldwide with our proprietary algorithms."
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: "Disaster Prevention",
      description: "Early warning systems for extreme weather events to protect lives and property."
    }
  ];

  const team = [
    {
      name: "Mr. Rikesh Shrestha",
      role: "Senior Developer and Founder",
      bio: "Former NOAA researcher with 15 years of experience in atmospheric science.",
      img: IMG1
    },
    {
      name: "James Rodriguez",
      role: "AI Lead",
      bio: "Machine learning expert specializing in climate pattern recognition.",
      img: IMG2
    },
    {
      name: "Priya Patel",
      role: "Data Engineer",
      bio: "Built our real-time data processing pipeline handling millions of requests daily.",
      img: IMG3
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <Cloud className="absolute top-20 left-10% h-40 w-40 text-blue-300" />
            <CloudRain className="absolute bottom-10 right-15% h-32 w-32 text-blue-300" />
            <CloudSun className="absolute top-1/3 right-20% h-36 w-36 text-blue-300" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Revolutionizing Weather Prediction Through <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                At RainCheck, we combine cutting-edge machine learning with decades of meteorological expertise to deliver the most accurate rainfall prediction system.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:w-1/2"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 mb-4">
                  RainCheck began as my 6th semester BCA project at Prime College, born from my passion for both meteorology and machine learning. As Rikesh Shrestha, I set out to create something more accurate than traditional weather apps – a rainfall prediction system powered by Random Forest algorithms.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  As RainCheck continues to evolve, our goal is to integrate more advanced ensemble techniques like Gradient Boosting and real-time IoT weather sensors for hyper-local predictions. We aim to partner with agricultural cooperatives and disaster management authorities in Nepal to help farmers plan crops and mitigate flood risks. 
                </p>
                <p className="text-lg text-gray-600">
                  Today, we serve over 5 million users worldwide and provide critical weather intelligence to agriculture, aviation, and emergency response organizations.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:w-1/2 bg-gray-100 rounded-2xl overflow-hidden shadow-lg"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
                  alt="Team working together" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technology</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Combining the best of atmospheric science and artificial intelligence
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                World-class experts in meteorology, AI, and data engineering
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={member.img} 
                      alt={`Portrait of ${member.name}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold mb-2">86%</p>
                <p className="text-gray-200">Prediction Accuracy</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold mb-2">5M+</p>
                <p className="text-gray-200">Active Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold mb-2">150+</p>
                <p className="text-gray-200">Countries Covered</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold mb-2">24/7</p>
                <p className="text-gray-200">Real-time Monitoring</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Experience the Future of Weather Prediction?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of individuals and businesses who trust RainCheck for their weather intelligence needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Get Started for Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Contact
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;