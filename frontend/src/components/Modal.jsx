import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="mt-12 md:mt-20 bg-white rounded-3xl shadow-2xl w-11/12 max-w-lg mx-4 relative animate-slideUp overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
          <h3 className="text-2xl font-bold text-white pr-10">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}