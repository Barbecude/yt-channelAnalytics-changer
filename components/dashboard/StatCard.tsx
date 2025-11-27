import React from 'react';
import { formatNumber } from '@/app/lib/formaters';


interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  
  const displayValue = !isNaN(Number(value)) ? formatNumber(value) : value;

  return (
    <div className="p-6 flex-1 bg-white space-x-6 overflow-x-auto"> 
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{displayValue}</p>
    </div>
  );
};

export default StatCard;