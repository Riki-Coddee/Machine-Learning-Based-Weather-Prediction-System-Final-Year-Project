import { CloudRain, Droplets } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={"/"} className="flex items-center space-x-2 cursor-pointer">
          <CloudRain className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">RainCheck</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="/#features"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            How It Works
          </a>
          <a
            href="/#technology"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Technology
          </a>
          <Link
            to="/prediction"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Prediction
          </Link>
        </nav>
      </div>
    </header>
  );
}
