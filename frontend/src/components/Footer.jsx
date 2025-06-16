import { CloudRain } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <footer className="py-8 px-4 bg-gray-900 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <CloudRain className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold">RainCheck</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              API
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} RainCheck. Advanced weather
            prediction powered by machine learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
