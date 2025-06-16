import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, BarChart3, AlertCircle } from "lucide-react";

function HistoricalDataVisualizer({ area }) {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  useEffect(() => {
    if (!area) return;

    async function fetchHistoricalData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/historical-trends/${area}?start_date=${formatDate(
            startDate
          )}&end_date=${formatDate(endDate)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch historical data");
        }

        const data = await response.json();
        setTrendData(data.rainfall_trend);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricalData();
  }, [area]);

  if (!area) {
    return (
      <div className="p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Historical Data
        </h3>
        <p className="text-gray-500">Select an area to see rainfall trends</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Data Unavailable
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Historical Data
          </h3>
          <p className="text-gray-500">
            No rainfall data available for this location
          </p>
        </div>
      </div>
    );
  }

  const totalRainfall = trendData.reduce(
    (sum, item) => sum + (item["Rainfall(mm)"] || 0),
    0
  );
  const avgRainfall = totalRainfall / trendData.length;
  const maxRainfall = Math.max(
    ...trendData.map((item) => item["Rainfall(mm)"] || 0)
  );

  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <TrendingUp className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Rainfall Trends</h2>
            </div>
            <p className="text-indigo-100">Last 7 days • {area}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalRainfall.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Total (mm)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {avgRainfall.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Average (mm)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {maxRainfall.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Peak (mm)</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="Date"
              fontSize={12}
              stroke="#6b7280"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis unit=" mm" fontSize={12} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
              }}
              labelFormatter={(value) =>
                `Date: ${new Date(value).toLocaleDateString()}`
              }
              formatter={(value) => [`${value} mm`, "Rainfall"]}
            />
            <Line
              type="monotone"
              dataKey="Rainfall(mm)"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#4f46e5" }}
              isAnimationActive={true}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>

        {trendData.every((d) => d["Rainfall(mm)"] === 0) && (
          <div className="text-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">
              No rainfall recorded in the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoricalDataVisualizer;
