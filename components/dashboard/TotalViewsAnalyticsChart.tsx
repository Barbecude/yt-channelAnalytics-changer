'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  date: string;
  views: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

// Helper untuk format angka (misal: 1500 -> 1.5K)
const formatCompactNumber = (number: number) => {
  return new Intl.NumberFormat('us-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
};

// Helper untuk format tanggal di Axis (misal: 2023-01 -> Jan 23)
const formatDateAxis = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // Fallback jika format error
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(date);
};

// Helper untuk format tanggal lengkap di Tooltip
const formatDateTooltip = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  // Handle jika data kosong agar tidak crash
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">Belum ada data analitik tersedia.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Performa Channel</h3>
        {/* Indikator total views sederhana */}
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Periode Ini</p>
          <p className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat('id-ID').format(
              data.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0)
            )}
          </p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Membuat efek gradasi warna merah Youtube */}
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDateAxis}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={10}
              minTickGap={30} // Agar tanggal tidak tumpang tindih
            />
            
            <YAxis 
              tickFormatter={formatCompactNumber}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={formatDateTooltip}
              formatter={(value: number) => [new Intl.NumberFormat('id-ID').format(value), 'Views']}
            />

            <Area
              type="monotone"
              dataKey="views"
              stroke="#ef4444" // Warna Merah
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViews)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;