"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Loader2,
  ArrowLeft,
  RefreshCw,
  MapPinIcon,
  PlusIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import Map from "../components/Map";
import WeatherCard from "../components/WeatherCard";
import PredictionResult from "../components/PredictionResult";
import LoadingState from "../components/LoadingState";
import HistoricalDataVisualizer from "../components/HistoricalDataVisualizer";

function PredictionPage() {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const OPENWEATHER_API_KEY = "879534249ba8994e78dc54c905135a09";
  const PREDICTION_API_URL = "http://localhost:5000/";

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setError(
              "Location access denied. Please allow location or select manually."
            );
            setLocation({ lat: 51.505, lng: -0.09 }); // London fallback
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported. Please select manually.");
      setLocation({ lat: 51.505, lng: -0.09 });
    }
  }, []);

  useEffect(() => {
    if (location) fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    if (!loading) setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch weather data");

      const data = await response.json();
      const transformed = {
        "Temperature(C)": data.main.temp,
        "Humidity(%)": data.main.humidity,
        "Pressure(hPa)": data.main.pressure,
        "WindSpeed(km/h)": data.wind.speed * 3.6,
        "CloudCover(%)": data.clouds.all,
        "Visibility(km)": data.visibility / 1000,
        "DewPoint(C)": data.main.temp,
        "UVIndex": 0,
        "SolarRadiation(W/m²)": data.clouds.all,
        "WindDirection(°)": data.wind.deg,
        "PrecipitationLastHour(mm)": 0,
        "SoilMoisture(%)": 0,
        "EvaporationRate(mm/day)": 0,
        "FeelsLikeTemp(C)": data.main.feels_like,
        "TempChange1h(C)": 0,
        "WindGust(km/h)": 0,
        "PressureTendency(hPa/3h)": 0,
      };

      setWeatherData({
        ...transformed,
        location: data.name,
        country: data.sys.country,
        weatherIcon: data.weather[0].icon,
        weatherDescription: data.weather[0].description,
      });

      await makePrediction(transformed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const makePrediction = async (params) => {
    try {
      const res = await fetch(PREDICTION_API_URL + "predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setError("Prediction server error. Is it running?");
    }
  };

  const handleLocationSelect = (newLocation) => setLocation(newLocation);

  const handleRefresh = () => {
    if (location) {
      fetchWeatherData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-mono tracking-tighter">
              Weather Prediction Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Real-time weather analysis and rainfall predictions
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Map and Historical Data */}
            <div className="xl:col-span-2 space-y-6">
              {/* Interactive Map */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left">
                  <div className="inline-flex space-x-2 items-center">
                    <PlusIcon />
                    <h2 className="text-xl font-semibold">
                      Location Selection
                    </h2>
                  </div>
                  <p className="text-blue-100">
                    Click anywhere on the map to get weather predictions for
                    that location
                  </p>
                </div>
                <div className="h-80 lg:h-96">
                  {location ? (
                    <Map
                      location={location}
                      onLocationSelect={handleLocationSelect}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Getting your location...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {location
                      ? `Coordinates: ${location.lat.toFixed(
                          4
                        )}, ${location.lng.toFixed(4)}`
                      : "Detecting location..."}
                  </p>
                </div>
              </div>

              {/* Historical Data Chart */}
              {location && weatherData && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <HistoricalDataVisualizer area={weatherData?.location} />
                </div>
              )}
            </div>

            {/* Right Column - Weather Data and Predictions */}
            <div className="space-y-6">
              {!location ? (
                <LoadingState message="Detecting your location..." />
              ) : loading ? (
                <LoadingState message="Analyzing weather patterns..." />
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center mb-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                    <h3 className="text-red-800 font-semibold">Error</h3>
                  </div>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : weatherData ? (
                <>
                  <WeatherCard weatherData={weatherData} />
                  {prediction && <PredictionResult prediction={prediction} />}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Location
                  </h3>
                  <p className="text-gray-600">
                    Click on the map to view weather data and predictions for
                    any location
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PredictionPage;
