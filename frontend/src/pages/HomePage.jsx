import { Link, useLocation } from "react-router-dom";
import {
  CloudRain,
  Brain,
  TrendingUp,
  Shield,
  Thermometer,
  Wind,
  Gauge,
  Cloud,
  Droplets,
  MapPin,
  BarChart3,
  Zap,
  CheckCircle,
  Github,
  Play,
} from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const section = document.querySelector(hash);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const teamDetails = [
    {
      name: "Suhana Parvin",
      github: "https://github.com/suhanaparvin12",
    },
    {
      name: "Sanket Banerjee",
      github: "https://github.com/Sanket2004",
    },
    {
      name: "Bithika Roy",
      github: "https://github.com/roybithika18",
    },
    {
      name: "Shouvik Kr. Ghosh",
      github: "https://github.com/ShouvikGhosh2",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4 mr-1" />
            Powered by Machine Learning
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight font-mono tracking-tighter">
            Predict Rainfall with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              {" "}
              AI Precision
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Advanced weather prediction using Random Forest machine learning.
            Get real-time rainfall forecasts, risk assessments, and personalized
            precautions based on comprehensive meteorological data.
          </p>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              A Group Project by
            </h3>
            <div className="flex flex-wrap justify-center">
              {teamDetails.map((member, index) => {
                return (
                  <a
                    key={index}
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center mr-4 mb-2 cursor-pointer"
                  >
                    <img
                      src={member.github + ".png"}
                      alt={member.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-gray-700 border-b">{member.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h3>
              Guided by{" "}
              <a href="https://scholar.google.com/citations?user=UcYPEX8AAAAJ&hl=en" className="border-b">
                Dr. Sheuli Chakraborty
              </a>
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/prediction"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Live Prediction
            </Link>
            <Link
              to={"/historical"}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Historical Data
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-16 px-4 bg-white scroll-m-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Weather Intelligence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our system combines multiple weather parameters with advanced ML
              algorithms to deliver accurate predictions and actionable
              insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CloudRain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Predictions
              </h3>
              <p className="text-gray-600">
                Get instant rainfall predictions based on current weather
                conditions using our trained Random Forest model.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Risk Assessment
              </h3>
              <p className="text-gray-600">
                Intelligent risk analysis with personalized precautions based on
                humidity, pressure, and weather patterns.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Historical Trends
              </h3>
              <p className="text-gray-600">
                Analyze rainfall patterns over time with area-specific
                historical data and trend visualization.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Area-Specific Data
              </h3>
              <p className="text-gray-600">
                Location-based predictions and historical analysis for targeted
                regional weather insights.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast API Response
              </h3>
              <p className="text-gray-600">
                Lightning-fast predictions through optimized Flask API with
                comprehensive error handling.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ML-Powered
              </h3>
              <p className="text-gray-600">
                Random Forest Classifier trained on comprehensive weather
                datasets for high-accuracy predictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Parameters */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Weather Parameters We Analyze
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our model considers five critical meteorological factors to make
              accurate rainfall predictions.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Thermometer className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Temperature</h3>
              <p className="text-sm text-gray-600">
                Celsius measurement for thermal analysis
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Humidity</h3>
              <p className="text-sm text-gray-600">
                Relative humidity percentage levels
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Gauge className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pressure</h3>
              <p className="text-sm text-gray-600">
                Atmospheric pressure in hectopascals
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Wind className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Wind Speed</h3>
              <p className="text-sm text-gray-600">
                Velocity in kilometers per hour
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cloud Cover</h3>
              <p className="text-sm text-gray-600">
                Percentage of sky coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-white scroll-m-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Our Prediction Engine Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced machine learning meets meteorological science for
              accurate rainfall forecasting.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Data Collection
                  </h3>
                  <p className="text-gray-600">
                    Weather parameters are collected including temperature,
                    humidity, pressure, wind speed, and cloud cover.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-semibold text-sm">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ML Processing
                  </h3>
                  <p className="text-gray-600">
                    Random Forest Classifier analyzes the data patterns using
                    100 decision trees for robust predictions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-semibold text-sm">
                    3
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Risk Analysis
                  </h3>
                  <p className="text-gray-600">
                    Rule-based system evaluates risk factors and generates
                    intelligent summaries of weather conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 font-semibold text-sm">
                    4
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Actionable Insights
                  </h3>
                  <p className="text-gray-600">
                    Personalized precautions and recommendations are generated
                    based on the prediction and risk assessment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  Prediction Logic
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    High Risk Indicators:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Humidity {">"} 80%
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Pressure {"<"} 1005 hPa
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Cloud Cover {">"} 70%
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Wind Speed {">"} 10 km/h
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Model Accuracy:
                  </h4>
                  <p className="text-sm text-gray-600">
                    Random Forest Classifier trained with 80/20 split achieving
                    high accuracy on test data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="py-16 px-4 bg-gray-50 scroll-m-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cutting-edge tools and frameworks power our rainfall prediction
              system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">ML</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Machine Learning
              </h3>
              <p className="text-sm text-gray-600">
                Scikit-learn, Pandas, NumPy
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">API</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <p className="text-sm text-gray-600">Flask, Python, REST API</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">UI</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <p className="text-sm text-gray-600">React, Vite, Tailwind CSS</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">VIZ</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Visualization
              </h3>
              <p className="text-sm text-gray-600">Recharts, Data Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-500 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Predict the Weather?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start using our advanced rainfall prediction system today and make
            informed decisions based on accurate weather forecasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/prediction"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Live Demo
            </Link>
            <button className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-all">
              <Github className="h-5 w-5 mr-2" />
              View Source Code
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
