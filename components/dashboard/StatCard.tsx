import React from 'react';
import { formatNumber } from '@/app/lib/formaters';
import { useChannel } from "@/app/context/ChannelContext";

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  // LOGIKA:
  // 1. Cek apakah value murni angka (belum ada Rp atau karakter aneh)
  // 2. Jika angka murni, format pakai formatNumber
  // 3. Jika sudah string (seperti "Rp 100"), biarkan saja
  
  const displayValue = !isNaN(Number(value)) ? formatNumber(value) : value;

  return (
    <div className="p-6 flex-1 bg-white space-x-6 overflow-x-auto"> 
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 whitespace-nowrap">{displayValue}</p>
    </div>
  );
};

export default StatCard;