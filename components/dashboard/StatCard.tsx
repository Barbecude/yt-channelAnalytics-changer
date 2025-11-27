// components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    // Hapus rounded-lg, border, shadow-xs dari sini
    <div className="p-6 flex-1 bg-white space-x-6"> 
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;