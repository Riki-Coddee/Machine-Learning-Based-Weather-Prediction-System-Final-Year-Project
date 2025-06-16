import { Thermometer, Droplets, Wind, Gauge, Cloud, MapPin } from "lucide-react"

const WeatherCard = ({ weatherData }) => {
  const {
    location,
    country,
    weatherIcon,
    weatherDescription,
    "Temperature(C)": temperature,
    "Humidity(%)": humidity,
    "Pressure(hPa)": pressure,
    "WindSpeed(km/h)": windSpeed,
    "CloudCover(%)": cloudCover,
  } = weatherData

  const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`

  const metrics = [
    {
      label: "Temperature",
      value: temperature !== undefined ? `${temperature.toFixed(1)}°C` : "N/A",
      Icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      label: "Humidity",
      value: humidity !== undefined ? `${humidity}%` : "N/A",
      Icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Pressure",
      value: pressure !== undefined ? `${pressure} hPa` : "N/A",
      Icon: Gauge,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      label: "Wind Speed",
      value: windSpeed !== undefined ? `${windSpeed.toFixed(1)} km/h` : "N/A",
      Icon: Wind,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Cloud Cover",
      value: cloudCover !== undefined ? `${cloudCover}%` : "N/A",
      Icon: Cloud,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header with location and weather icon */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold">
                {location}, {country}
              </h2>
            </div>
            <p className="text-blue-100 capitalize text-lg">{weatherDescription}</p>
          </div>
          <div className="text-right">
            <img
              src={iconUrl || "/placeholder.svg"}
              alt={weatherDescription}
              className="w-16 h-16 drop-shadow-lg"
              role="img"
              aria-label={`Weather icon showing ${weatherDescription}`}
            />
          </div>
        </div>
      </div>

      {/* Weather metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map(({ label, value, Icon, color, bgColor, borderColor }) => (
            <div
              key={label}
              className={`p-4 rounded-xl border ${bgColor} ${borderColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${bgColor} border ${borderColor}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <span className="ml-3 text-gray-700 font-medium">{label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with timestamp */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-left">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

export default WeatherCard
