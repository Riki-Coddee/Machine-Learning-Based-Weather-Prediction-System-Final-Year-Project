import { Umbrella, AlertCircle, CheckCircle, Shield, Info, Clock } from "lucide-react"

const PredictionResult = ({ prediction }) => {
  const { RainfallPrediction, RiskSummary, Precautions } = prediction

  // Determine the card theme based on rainfall prediction
  const isRainy = RainfallPrediction === "Yes"

  const theme = isRainy
    ? {
        gradient: "from-red-500 to-orange-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        iconColor: "text-red-500",
      }
    : {
        gradient: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        iconColor: "text-green-500",
      }

  const MainIcon = isRainy ? Umbrella : CheckCircle

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header with prediction result */}
      <div className={`p-6 bg-gradient-to-r ${theme.gradient} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Rainfall Prediction</h3>
            <div className="flex items-center">
              <MainIcon className="h-6 w-6 mr-2" />
              <span className="text-lg font-medium">{isRainy ? "Rain Expected" : "No Rain Expected"}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-full p-3">
              <MainIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Risk Summary */}
        {RiskSummary !== "normal conditions" && (
          <div className={`p-4 rounded-xl border ${theme.bgColor} ${theme.borderColor}`}>
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${theme.bgColor} border ${theme.borderColor} mr-3`}>
                <AlertCircle className={`h-5 w-5 ${theme.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${theme.textColor} mb-1`}>Weather Conditions</h4>
                <p className="text-gray-700 capitalize">{RiskSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Precautions */}
        <div>
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 mr-3">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Recommended Precautions</h4>
          </div>

          <div className="space-y-3">
            {Array.isArray(Precautions) ? (
              Precautions.map((precaution, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-4 w-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-start">{precaution}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-start">{Precautions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Confidence indicator */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>Prediction generated at {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionResult
