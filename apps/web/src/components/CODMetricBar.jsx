import React from 'react';

export default function CODMetricBar({ totalCOD, collected, pendingStops }) {
  const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm font-medium">To Collect</span>
        <span className="text-xl font-bold text-gray-900">{formatVND(totalCOD)}</span>
      </div>
      <div className="h-10 w-px bg-gray-200"></div>
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm font-medium">Collected</span>
        <span className="text-xl font-bold text-grab">{formatVND(collected)}</span>
      </div>
      <div className="h-10 w-px bg-gray-200"></div>
      <div className="flex flex-col items-end">
        <span className="text-gray-500 text-sm font-medium">Pending</span>
        <span className="text-xl font-bold text-orange-500">{pendingStops}</span>
      </div>
    </div>
  );
}
