import React, { useEffect, useState } from "react";
import HistoricalDataVisualizer from "../components/HistoricalDataVisualizer";
import Select from "react-select";
import { Clock } from "lucide-react";

// Custom styles for react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px #bfdbfe" : "none",
    minHeight: "3rem",
    fontSize: "1rem",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "#e0e7ff"
      : "#fff",
    color: state.isSelected ? "#fff" : "#1e293b",
    fontWeight: state.isSelected ? 600 : 400,
    fontSize: "1rem",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#64748b",
    fontSize: "1rem",
  }),
};

export default function HistoricalData() {
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAreas() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/areas");        
        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }
        const areas = await response.json();
        const options = areas.map((a) => ({ value: a, label: a }));
        setAreaOptions(options);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAreas();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-3xl mt-16 mb-10 bg-white/80 rounded-3xl shadow-2xl px-8 py-12 flex flex-col items-center animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center drop-shadow-lg font-mono">
          📊 Historical Data
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
          Explore historical trends for different areas. Select an area below to
          visualize the data.
        </p>
        <div className="w-full max-w-md mb-8">
          <Select
            options={areaOptions}
            onChange={setSelectedArea}
            isLoading={loading}
            isClearable
            placeholder="🔍 Select an area"
            styles={customSelectStyles}
          />
        </div>
        {selectedArea ? (
          <div className="w-full mt-8">
            <HistoricalDataVisualizer area={selectedArea.value} />
          </div>
        ) : (
          <div className="w-full mt-8 flex flex-col items-center text-blue-300">
            <Clock className="h-12 w-12 mb-4"/>
            <span className="text-lg">Select an area to see the data!</span>
          </div>
        )}
      </section>
    </div>
  );
}
