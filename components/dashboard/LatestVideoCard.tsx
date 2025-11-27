// components/dashboard/VideoCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Eye, ThumbsUp, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";

// Helper formatter angka (sebaiknya pindahkan ke lib/utils.ts)
const formatNumber = (num: string | number) => {
  const val = typeof num === 'string' ? parseInt(num) : num;
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: "compact", compactDisplay: "short", maximumFractionDigits: 1
  }).format(val);
};

interface VideoCardProps {
  video: {
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
    };
    statistics?: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  };
}


export default function LatestVideoCard({ video }: VideoCardProps) {
  const { snippet, statistics, id } = video;
// if (!video || !video.snippet) {
//     return null; // Atau return <Skeleton /> jika punya loading state
//   }

  // --- LOGIC PERHITUNGAN RASIO (ENGAGEMENT RATE) ---
  const views = parseInt(statistics?.viewCount || "0");
  const likes = parseInt(statistics?.likeCount || "0");
  const comments = parseInt(statistics?.commentCount || "0");

  // Hitung Rasio: ((Likes + Comments) / Views) * 100
  // Jika views 0, set rasio ke 0 untuk hindari error division by zero
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
  const isGoodPerformance = engagementRate > 1.5;


  return (
    <Link 
      href={`https://www.youtube.com/watch?v=${id}`} 
      target="_blank" 
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      {/* Bagian Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        <Image
          src={snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url}
          alt={snippet.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Bagian Content */}
      <div className="p-4 flex justify-between flex-col flex-1">
        <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:underline">
            {snippet.title}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
            
            {new Date(snippet.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            })}
            </p>
        </div>
        {/* Bagian Statistik (Views & Likes) */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-1">
            {/* Icon Mata (Views) */}
            <Eye size={16} className="text-gray-500" />
            <span>{statistics ? formatNumber(statistics.viewCount) : '-'}</span>
          </div>
   
             {/* Icon Like */}
            <div className="flex items-center gap-1">
            <ThumbsUp size={16} className="text-gray-500" />
              <span>{statistics ? formatNumber(statistics.likeCount) : '-'}</span>
            </div>
            
            {/* Icon Comment */}
            <div className="flex items-center gap-1">
                   <MessageSquare size={16} className="text-gray-500" />
               <span>{statistics ? formatNumber(statistics.commentCount) : '-'}</span>
            </div>

            {statistics && (
            <div className={`flex text-end items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ml-auto ${
                isGoodPerformance 
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}>
                {isGoodPerformance ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                Eng. Rate
                <span>{engagementRate.toFixed(1)}%</span>
            </div>
            )}

     {/* --- BADGE PERFORMA BARU --- */}
        </div>
      </div>
    </Link>
  );
}