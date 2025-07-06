import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  Droplet,
  Compass,
  Sunrise,
  Sunset,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WeatherNewsPortal = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [randomLocationsWeather, setRandomLocationsWeather] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Kathmandu");
  const [activeTab, setActiveTab] = useState("current");
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const navigate = useNavigate();
  const OPENWEATHER_API_KEY = "879534249ba8994e78dc54c905135a09";

  // Enhanced dynamic theme system
  const getThemeConfig = () => {
    if (!weatherData)
      return {
        bg: "from-blue-50 to-indigo-100",
        text: "text-gray-800",
        card: "bg-white/80",
        icon: "text-indigo-600",
        accent: "bg-indigo-100",
        button: "bg-indigo-500 hover:bg-indigo-600",
        border: "border-white/20",
        glass: "bg-white/20 backdrop-blur-md",
        newsTag: "bg-indigo-500",
      };

    const now = moment();
    const sunrise = moment.unix(weatherData.sunrise);
    const sunset = moment.unix(weatherData.sunset);
    const isDay = now.isBetween(sunrise, sunset);
    const condition = weatherData.condition.toLowerCase();

    // Day themes
    if (isDay) {
      switch (condition) {
        case "clear":
          return {
            bg: "from-sky-400 to-amber-200",
            text: "text-gray-900",
            card: "bg-white/80",
            icon: "text-amber-600",
            accent: "bg-amber-100",
            button: "bg-amber-500 hover:bg-amber-600",
            border: "border-amber-200",
            glass: "bg-amber-100/30 backdrop-blur-md",
            newsTag: "bg-amber-500",
          };
        case "clouds":
          return {
            bg: "from-gray-300 to-blue-200",
            text: "text-gray-800",
            card: "bg-white/80",
            icon: "text-blue-600",
            accent: "bg-blue-100",
            button: "bg-blue-500 hover:bg-blue-600",
            border: "border-blue-200",
            glass: "bg-blue-100/30 backdrop-blur-md",
            newsTag: "bg-blue-500",
          };
        case "rain":
          return {
            bg: "from-blue-600 to-gray-400",
            text: "text-white",
            card: "bg-gray-700/80",
            icon: "text-blue-200",
            accent: "bg-blue-900/80",
            button: "bg-blue-600 hover:bg-blue-700",
            border: "border-blue-300/30",
            glass: "bg-blue-800/30 backdrop-blur-md",
            newsTag: "bg-blue-600",
          };
        case "snow":
          return {
            bg: "from-blue-100 to-cyan-100",
            text: "text-gray-800",
            card: "bg-white/90",
            icon: "text-cyan-600",
            accent: "bg-cyan-100",
            button: "bg-cyan-500 hover:bg-cyan-600",
            border: "border-cyan-200",
            glass: "bg-cyan-100/30 backdrop-blur-md",
            newsTag: "bg-cyan-500",
          };
        case "thunderstorm":
          return {
            bg: "from-gray-800 to-purple-800",
            text: "text-white",
            card: "bg-gray-900/80",
            icon: "text-purple-300",
            accent: "bg-purple-900/80",
            button: "bg-purple-600 hover:bg-purple-700",
            border: "border-purple-300/30",
            glass: "bg-purple-900/30 backdrop-blur-md",
            newsTag: "bg-purple-600",
          };
        default:
          return {
            bg: "from-blue-50 to-indigo-100",
            text: "text-gray-800",
            card: "bg-white/80",
            icon: "text-indigo-600",
            accent: "bg-indigo-100",
            button: "bg-indigo-500 hover:bg-indigo-600",
            border: "border-indigo-200",
            glass: "bg-indigo-100/30 backdrop-blur-md",
            newsTag: "bg-indigo-500",
          };
      }
    }
    // Night themes
    else {
      switch (condition) {
        case "clear":
          return {
            bg: "from-indigo-900 to-purple-900",
            text: "text-white",
            card: "bg-gray-800/80",
            icon: "text-yellow-300",
            accent: "bg-purple-900/80",
            button: "bg-purple-600 hover:bg-purple-700",
            border: "border-purple-300/30",
            glass: "bg-purple-900/30 backdrop-blur-md",
            newsTag: "bg-purple-600",
          };
        case "clouds":
          return {
            bg: "from-slate-700 to-slate-900",
            text: "text-white",
            card: "bg-gray-800/80",
            icon: "text-gray-300",
            accent: "bg-gray-800/80",
            button: "bg-gray-600 hover:bg-gray-700",
            border: "border-gray-300/30",
            glass: "bg-gray-800/30 backdrop-blur-md",
            newsTag: "bg-gray-600",
          };
        case "rain":
          return {
            bg: "from-blue-900 to-gray-800",
            text: "text-white",
            card: "bg-gray-800/80",
            icon: "text-blue-300",
            accent: "bg-blue-900/80",
            button: "bg-blue-700 hover:bg-blue-800",
            border: "border-blue-300/30",
            glass: "bg-blue-900/30 backdrop-blur-md",
            newsTag: "bg-blue-700",
          };
        case "snow":
          return {
            bg: "from-blue-900 to-indigo-900",
            text: "text-white",
            card: "bg-blue-900/80",
            icon: "text-blue-200",
            accent: "bg-indigo-900/80",
            button: "bg-blue-600 hover:bg-blue-700",
            border: "border-blue-300/30",
            glass: "bg-blue-900/30 backdrop-blur-md",
            newsTag: "bg-blue-600",
          };
        case "thunderstorm":
          return {
            bg: "from-gray-900 to-purple-900",
            text: "text-white",
            card: "bg-gray-900/80",
            icon: "text-purple-300",
            accent: "bg-purple-900/80",
            button: "bg-purple-700 hover:bg-purple-800",
            border: "border-purple-300/30",
            glass: "bg-purple-900/30 backdrop-blur-md",
            newsTag: "bg-purple-700",
          };
        default:
          return {
            bg: "from-blue-900 to-indigo-900",
            text: "text-white",
            card: "bg-blue-900/80",
            icon: "text-indigo-300",
            accent: "bg-indigo-900/80",
            button: "bg-indigo-600 hover:bg-indigo-700",
            border: "border-indigo-300/30",
            glass: "bg-indigo-900/30 backdrop-blur-md",
            newsTag: "bg-indigo-600",
          };
      }
    }
  };

  const theme = getThemeConfig();
  const isDaytime = weatherData
    ? moment().isBetween(
        moment.unix(weatherData.sunrise),
        moment.unix(weatherData.sunset)
      )
    : true;

  // Parallax effect handler
  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.3);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const generateRandomCoordinates = (count = 6) => {
    // Major cities and landmarks across Nepal with their coordinates
    const nepaliLocations = [
      { name: "Kathmandu", lat: 27.7172, lon: 85.324 },
      { name: "Patan (Lalitpur)", lat: 27.6667, lon: 85.3167 },
      { name: "Bhaktapur", lat: 27.671, lon: 85.4296 },
      { name: "Kirtipur", lat: 27.6667, lon: 85.2833 },
      { name: "Thimi", lat: 27.681, lon: 85.385 },
      { name: "Budhanilkantha", lat: 27.7786, lon: 85.3719 },
      { name: "Nagarkot", lat: 27.7156, lon: 85.52 },
      { name: "Dhulikhel", lat: 27.6175, lon: 85.5389 },
      { name: "Kakani", lat: 27.9167, lon: 85.15 },

      // Western Nepal
      { name: "Pokhara", lat: 28.2096, lon: 83.9856 },
      { name: "Lumbini", lat: 27.4692, lon: 83.2752 },
      { name: "Butwal", lat: 27.7006, lon: 83.4484 },
      { name: "Tansen", lat: 27.8667, lon: 83.55 },
      { name: "Nepalgunj", lat: 28.05, lon: 81.6167 },
      { name: "Surkhet", lat: 28.6, lon: 81.6333 },
      { name: "Dhangadhi", lat: 28.7, lon: 80.6 },
      { name: "Mahendranagar", lat: 28.9167, lon: 80.3333 },
      { name: "Ghorahi", lat: 28.0333, lon: 82.4833 },
      { name: "Tulsipur", lat: 28.13, lon: 82.3 },

      // Central Nepal
      { name: "Chitwan", lat: 27.5175, lon: 84.3547 },
      { name: "Bharatpur", lat: 27.6855, lon: 84.4336 },
      { name: "Hetauda", lat: 27.4167, lon: 85.0333 },
      { name: "Janakpur", lat: 26.7271, lon: 85.9406 },
      { name: "Birgunj", lat: 27.0, lon: 84.8667 },
      { name: "Kalaiya", lat: 27.0333, lon: 85.0 },
      { name: "Gaur", lat: 26.7667, lon: 85.2667 },
      { name: "Rajbiraj", lat: 26.5333, lon: 86.75 },
      { name: "Siraha", lat: 26.65, lon: 86.2 },
      { name: "Jaleshwar", lat: 26.6333, lon: 85.8 },

      // Eastern Nepal
      { name: "Biratnagar", lat: 26.4842, lon: 87.2836 },
      { name: "Dharan", lat: 26.8146, lon: 87.2797 },
      { name: "Ilam", lat: 26.9, lon: 87.9333 },
      { name: "Dhankuta", lat: 26.9833, lon: 87.3333 },
      { name: "Bhojpur", lat: 27.1667, lon: 87.05 },
      { name: "Damak", lat: 26.65, lon: 87.7 },
      { name: "Itahari", lat: 26.6667, lon: 87.2833 },
      { name: "Inaruwa", lat: 26.6, lon: 87.15 },
      { name: "Birtamod", lat: 26.65, lon: 87.9833 },
      { name: "Phidim", lat: 27.15, lon: 87.7667 },

      // Himalayan Region
      { name: "Everest Base Camp", lat: 27.9881, lon: 86.925 },
      { name: "Annapurna Base Camp", lat: 28.5275, lon: 83.8106 },
      { name: "Mustang", lat: 28.749, lon: 83.8725 },
      { name: "Manang", lat: 28.6667, lon: 84.0167 },
      { name: "Jomsom", lat: 28.7833, lon: 83.7333 },
      { name: "Dolpa", lat: 29.1667, lon: 82.9167 },
      { name: "Rara Lake", lat: 29.5267, lon: 82.0886 },
      { name: "Langtang", lat: 28.2167, lon: 85.5167 },
      { name: "Gosaikunda", lat: 28.0833, lon: 85.4167 },
      { name: "Namche Bazaar", lat: 27.8042, lon: 86.7139 },
    ];

    // If we want more locations than we have predefined, generate random ones within Nepal's bounds
    if (count > nepaliLocations.length) {
      const nepalBounds = {
        minLat: 26.347, // Southernmost point
        maxLat: 30.447, // Northernmost point
        minLon: 80.0586, // Westernmost point
        maxLon: 88.201, // Easternmost point
      };

      for (let i = nepaliLocations.length; i < count; i++) {
        const lat = (
          Math.random() * (nepalBounds.maxLat - nepalBounds.minLat) +
          nepalBounds.minLat
        ).toFixed(4);
        const lon = (
          Math.random() * (nepalBounds.maxLon - nepalBounds.minLon) +
          nepalBounds.minLon
        ).toFixed(4);
        nepaliLocations.push({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          name: `Location ${i + 1}`,
        });
      }
    }

    // Shuffle the array and return the requested number of locations
    return nepaliLocations
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .map((loc) => ({
        ...loc,
        lat: loc.lat.toFixed(4),
        lon: loc.lon.toFixed(4),
      }));
  };
  // Fetch weather for random locations
  const fetchRandomLocationsWeather = async () => {
    const randomCoords = generateRandomCoordinates();
    const requests = randomCoords.map((coord) =>
      axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coord.lat}&lon=${coord.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      )
    );
    try {
      const responses = await Promise.all(requests);
      const formattedData = responses.map((res, index) => ({
        ...res.data,
        name: randomCoords[index].name || res.data.name,
        temp: Math.round(res.data.main.temp),
        feels_like: Math.round(res.data.main.feels_like),
        condition: res.data.weather[0].main,
        icon: res.data.weather[0].icon,
        humidity: res.data.main.humidity,
        wind_speed: Math.round(res.data.wind.speed * 3.6),
        lat: randomCoords[index].lat, // Add this
        lon: randomCoords[index].lon, // Add this
      }));
      setRandomLocationsWeather(formattedData);
    } catch (error) {
      console.error("Error fetching nearby locations weather:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const enhancedData = {
          ...weatherResponse.data,
          city: weatherResponse.data.name,
          condition: weatherResponse.data.weather[0].main,
          temp: Math.round(weatherResponse.data.main.temp),
          feels_like: Math.round(weatherResponse.data.main.feels_like),
          icon: weatherResponse.data.weather[0].icon,
          humidity: weatherResponse.data.main.humidity,
          wind_speed: Math.round(weatherResponse.data.wind.speed * 3.6),
          pressure: weatherResponse.data.main.pressure,
          visibility: weatherResponse.data.visibility / 1000,
          wind_deg: weatherResponse.data.wind.deg,
          sunrise: weatherResponse.data.sys.sunrise,
          sunset: weatherResponse.data.sys.sunset,
        };

        setWeatherData(enhancedData);
        await fetchRandomLocationsWeather();

        const newsResponse = await axios.get(
          "http://localhost:5000/api/admin/news"
        );
        const formattedNews = newsResponse.data.map((newsItem) => ({
          id: newsItem.id,
          title: newsItem.title,
          content: newsItem.content,
          category: newsItem.category,
          image: newsItem.image,
          date: new Date(newsItem.date),
        }));

        setNewsData(formattedNews);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const handleReadMore = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  // Weather icon component with dynamic colors
  const WeatherIcon = ({ condition, size = 8 }) => {
    const iconMap = {
      clear: <Sun className={`${theme.icon} h-${size} w-${size}`} />,
      clouds: <Cloud className={`${theme.icon} h-${size} w-${size}`} />,
      rain: <CloudRain className={`${theme.icon} h-${size} w-${size}`} />,
      snow: <CloudSnow className={`${theme.icon} h-${size} w-${size}`} />,
      thunderstorm: (
        <CloudLightning className={`${theme.icon} h-${size} w-${size}`} />
      ),
    };

    return (
      iconMap[condition.toLowerCase()] || (
        <Cloud className={`${theme.icon} h-${size} w-${size}`} />
      )
    );
  };

  // Weather stat card component
  const WeatherStatCard = ({ icon, label, value }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${theme.card} p-3 rounded-xl shadow-md ${theme.border} border`}
    >
      <div className={`flex items-center justify-center ${theme.text}`}>
        <div className={`mr-2 ${theme.icon}`}>{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      <p className={`text-2xl mt-1 font-medium text-center ${theme.text}`}>
        {value}
      </p>
    </motion.div>
  );

  // Weather detail card component
  const WeatherDetailCard = ({ icon, label, value }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`${theme.card} p-4 rounded-xl shadow-md ${theme.border} border`}
    >
      <div className={`flex items-center ${theme.text}`}>
        <div className={`mr-2 ${theme.icon}`}>{icon}</div>
        <span>{label}</span>
      </div>
      <p className={`text-xl mt-2 font-medium ${theme.text}`}>{value}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"
          ></motion.div>
          <p className="mt-4 text-gray-600 text-lg">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-all duration-1000 ${theme.text}`}
    >
      {/* Hero Weather Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(/images/weather-pattern-${
              isDaytime ? "day" : "night"
            }.svg)`,
            backgroundSize: "cover",
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${theme.glass} rounded-3xl shadow-2xl overflow-hidden ${theme.border} border`}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Panel - Weather Overview */}
              <div className="lg:w-1/2 p-8 lg:p-12 relative">
                <div className="absolute top-6 right-6 flex space-x-2">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      activeTab === "current" ? theme.button : theme.glass
                    }`}
                  >
                    Current
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      activeTab === "details" ? theme.button : theme.glass
                    }`}
                  >
                    Details
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "current" ? (
                    <motion.div
                      key="current"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center mb-2">
                        <MapPin className={`h-5 w-5 mr-2 ${theme.icon}`} />
                        <h2 className="text-2xl md:text-3xl font-bold">
                          {weatherData?.city || "Kathmandu"}
                        </h2>
                      </div>
                      <p className="text-lg opacity-90">
                        {moment().format("dddd, MMMM Do")}
                      </p>

                      <div className="flex items-center mt-8">
                        <div className="text-7xl md:text-8xl font-light mr-6">
                          {weatherData?.temp || "22"}°
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center">
                            <WeatherIcon
                              condition={weatherData?.condition}
                              size={12}
                            />
                            <span className="text-2xl ml-3 capitalize">
                              {weatherData?.condition || "Partly Cloudy"}
                            </span>
                          </div>
                          <p className="mt-2 text-lg">
                            Feels like {weatherData?.feels_like || "24"}°
                          </p>
                        </div>
                      </div>

                      <div className="mt-10 grid grid-cols-3 gap-4">
                        <WeatherStatCard
                          icon={<Droplets className="h-5 w-5" />}
                          label="Humidity"
                          value={`${weatherData?.humidity || "65"}%`}
                        />
                        <WeatherStatCard
                          icon={<Wind className="h-5 w-5" />}
                          label="Wind"
                          value={`${weatherData?.wind_speed || "12"} km/h`}
                        />
                        <WeatherStatCard
                          icon={<Gauge className="h-5 w-5" />}
                          label="Pressure"
                          value={`${weatherData?.pressure || "1015"} hPa`}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <h3 className="text-2xl font-bold mb-6 flex items-center">
                        <Clock className={`h-6 w-6 mr-2 ${theme.icon}`} />
                        Weather Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <WeatherDetailCard
                          icon={<Compass className="h-5 w-5" />}
                          label="Wind Direction"
                          value={`${weatherData?.wind_deg || "0"}°`}
                        />
                        <WeatherDetailCard
                          icon={<Droplet className="h-5 w-5" />}
                          label="Visibility"
                          value={`${
                            weatherData?.visibility?.toFixed(1) || "10.0"
                          } km`}
                        />
                        <WeatherDetailCard
                          icon={<Sunrise className="h-5 w-5" />}
                          label="Sunrise"
                          value={moment
                            .unix(weatherData?.sunrise)
                            .format("h:mm A")}
                        />
                        <WeatherDetailCard
                          icon={<Sunset className="h-5 w-5" />}
                          label="Sunset"
                          value={moment
                            .unix(weatherData?.sunset)
                            .format("h:mm A")}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Panel - Weather Visual */}
              <div
                className={`lg:w-1/2 ${theme.glass} p-8 lg:p-12 ${theme.border} border-l`}
              >
                <div className="h-full flex flex-col justify-center items-center">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="mb-8"
                  >
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData?.icon}@4x.png`}
                      alt={weatherData?.condition}
                      className="h-40 w-40"
                    />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">
                      {weatherData?.condition || "Clear"}
                    </h3>
                    <p className="opacity-90">
                      {isDaytime ? "Beautiful day ahead!" : "Clear night skies"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nearby Locations Section */}

      {randomLocationsWeather.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <Navigation className={`h-8 w-8 mr-2 ${theme.icon}`} />
                Weather Around Nepal
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {randomLocationsWeather.map((location, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      navigate(
                        `/prediction?lat=${location.lat}&lon=${location.lon}`
                      )
                    }
                    className="cursor-pointer" // Added cursor-pointer here
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`${theme.card} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${theme.border} border`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <MapPin className={`h-5 w-5 mr-2 ${theme.icon}`} />
                            <h3 className="text-xl font-bold">
                              {location.name || `Location ${index + 1}`}
                            </h3>
                          </div>
                          <div className="flex items-center">
                            <WeatherIcon
                              condition={location.condition}
                              size={6}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl font-light">
                            {location.temp}°
                          </div>
                          <div className="text-right">
                            <p className="opacity-80 capitalize">
                              {location.condition}
                            </p>
                            <p className="text-sm opacity-60">
                              Feels like {location.feels_like}°
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center">
                            <Droplets
                              className={`h-4 w-4 mr-2 ${theme.icon}`}
                            />
                            <span>Humidity: {location.humidity}%</span>
                          </div>
                          <div className="flex items-center">
                            <Wind className={`h-4 w-4 mr-2 ${theme.icon}`} />
                            <span>Wind: {location.wind_speed} km/h</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Weather News Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest Weather News</h2>
              <button
              onClick={() => navigate("/all-news")}
                className={`${theme.button} px-4 py-2 rounded-full font-medium flex items-center`}
              >
                View All <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.slice(0, 6).map((newsItem) => (
                <motion.div
                  key={newsItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`${theme.card} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${theme.border} border`}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={`http://localhost:5000/${newsItem.image}`}
                      alt={newsItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-news.jpg";
                      }}
                    />
                    <div
                      className={`absolute top-4 right-4 ${theme.newsTag} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}
                    >
                      {newsItem.category || "News"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm opacity-80 mb-2">
                      <Calendar className={`h-4 w-4 mr-1 ${theme.icon}`} />
                      <span>
                        {moment(newsItem.date).format("MMMM D, YYYY")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{newsItem.title}</h3>
                    <p className="opacity-80 mb-4">
                      {newsItem.content.length > 100
                        ? `${newsItem.content.substring(0, 100)}...`
                        : newsItem.content}
                    </p>
                    <button
                      onClick={() => handleReadMore(newsItem.id)}
                      className={`${theme.button} px-3 py-1 rounded-full font-medium flex items-center`}
                    >
                      Read more <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Weather Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">
              Detailed Weather Statistics
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className={`${theme.card} p-6 rounded-2xl shadow-lg ${theme.border} border`}
              >
                <div className="flex items-center mb-4">
                  <Thermometer className={`h-6 w-6 mr-2 ${theme.icon}`} />
                  <h3 className="text-lg font-semibold">Temperature</h3>
                </div>
                <div className="space-y-2">
                  <p>Current: {weatherData?.temp}°C</p>
                  <p>Feels Like: {weatherData?.feels_like}°C</p>
                  <p>Humidity: {weatherData?.humidity}%</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className={`${theme.card} p-6 rounded-2xl shadow-lg ${theme.border} border`}
              >
                <div className="flex items-center mb-4">
                  <Wind className={`h-6 w-6 mr-2 ${theme.icon}`} />
                  <h3 className="text-lg font-semibold">Wind Details</h3>
                </div>
                <div className="space-y-2">
                  <p>Speed: {weatherData?.wind_speed} km/h</p>
                  <p>Direction: {weatherData?.wind_deg}°</p>
                  <p>Gust: {weatherData?.wind?.gust || "N/A"} km/h</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className={`${theme.card} p-6 rounded-2xl shadow-lg ${theme.border} border`}
              >
                <div className="flex items-center mb-4">
                  <Droplet className={`h-6 w-6 mr-2 ${theme.icon}`} />
                  <h3 className="text-lg font-semibold">Atmospheric</h3>
                </div>
                <div className="space-y-2">
                  <p>Pressure: {weatherData?.pressure} hPa</p>
                  <p>Visibility: {weatherData?.visibility?.toFixed(1)} km</p>
                  <p>Cloud Cover: {weatherData?.clouds?.all || "0"}%</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className={`${theme.card} p-6 rounded-2xl shadow-lg ${theme.border} border`}
              >
                <div className="flex items-center mb-4">
                  <Compass className={`h-6 w-6 mr-2 ${theme.icon}`} />
                  <h3 className="text-lg font-semibold">Sun Times</h3>
                </div>
                <div className="space-y-2">
                  <p>
                    Sunrise:{" "}
                    {moment.unix(weatherData?.sunrise).format("h:mm A")}
                  </p>
                  <p>
                    Sunset: {moment.unix(weatherData?.sunset).format("h:mm A")}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WeatherNewsPortal;
