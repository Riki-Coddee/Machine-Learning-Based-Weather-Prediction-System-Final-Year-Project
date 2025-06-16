import { Loader2, CloudRain, Brain } from "lucide-react"

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 w-max mx-auto animate-pulse">
            <CloudRain className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Loading spinner and text */}
        <div className="mb-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        </div>

        {/* Progress steps */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
            <span>Analyzing weather patterns</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse delay-100"></div>
            <span>Processing meteorological data</span>
          </div>
          <div className="flex items-center justify-center">
            <Brain className="h-4 w-4 text-blue-500 mr-2" />
            <span>Running ML predictions</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingState
