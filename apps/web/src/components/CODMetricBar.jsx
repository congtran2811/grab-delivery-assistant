import React from 'react';

export default function CODMetricBar({ totalCOD, collected, pendingStops, t }) {
  const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center mb-6 transition-colors">
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{t.toCollect}</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatVND(totalCOD)}</span>
      </div>
      <div className="h-8 sm:h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{t.collected}</span>
        <span className="text-lg sm:text-xl font-bold text-grab">{formatVND(collected)}</span>
      </div>
      <div className="h-8 sm:h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-col items-end">
        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{t.pending}</span>
        <span className="text-lg sm:text-xl font-bold text-orange-500">{pendingStops}</span>
      </div>
    </div>
  );
}
