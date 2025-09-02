import React from "react";

interface ProgressBarProps {
  totalProgress: number;  
  currentProgress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalProgress,  currentProgress }) => {
  const progressPercent = (currentProgress / totalProgress) * 100;

  return (
    <div className="relative bg-gray-200 rounded-full h-6 shadow-lg">
    {/* Progress fill */}
    <div
        className="bg-green-500 h-6 rounded-full transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
    />

    {/* Progress text */}
    <div className="absolute w-full text-center text-sm font-medium top-0 leading-6">
        {currentProgress} / {totalProgress}
    </div>
    </div>
  );
};

export default ProgressBar;
