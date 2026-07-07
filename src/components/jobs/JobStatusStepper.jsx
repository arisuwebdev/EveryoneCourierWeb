import React from 'react';
import { Check } from "lucide-react";

export default function JobStatusStepper({ currentStatus }) {
  const statuses = ['open', 'assigned', 'picked_up', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);

  const getStepClass = (index) => {
    if (index < currentIndex) {
      return "bg-blue-600 text-white"; // Completed
    }
    if (index === currentIndex) {
      return "bg-blue-200 text-blue-800 border-2 border-blue-600 animate-pulse"; // Current
    }
    return "bg-slate-200 text-slate-500"; // Future
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${getStepClass(index)}`}>
                {index < currentIndex ? <Check /> : index + 1}
              </div>
              <p className={`mt-2 text-xs font-medium text-center ${index <= currentIndex ? 'text-slate-800' : 'text-slate-400'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className={`flex-1 h-1 transition-all duration-500 ${index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}