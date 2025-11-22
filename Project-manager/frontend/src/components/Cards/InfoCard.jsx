import React from "react";

const InfoCard = ({ label, value, color }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Icon Circle */}
      <div className={`w-2 h-3 md:w-2 md:h-5 rounded-full ${color}`} />
   
      <p className="text-xs md:text-[14px] text-gray-500">
        <span className="text-sm md:text-base text-black font-semibold">
          {value}
        </span> {label}
      </p>
    </div>
  );
};

export default InfoCard;
