// components/VideoCard.tsx
import Image from "next/image";
import Link from "next/link";

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

export default function VideoCard({ video }: VideoCardProps) {
  const { snippet, statistics, id } = video;

  return (
    <Link 
      href={`https://www.youtube.com/watch?v=${id}`} 
      target="_blank" 
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Bagian Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        <Image
          src={snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url}
          alt={snippet.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Bagian Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {snippet.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          {new Date(snippet.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </p>

        {/* Bagian Statistik (Views & Likes) */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-1">
            {/* Icon Mata (Views) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>{statistics ? formatNumber(statistics.viewCount) : '-'}</span>
          </div>

          <div className="flex items-center gap-3">
             {/* Icon Like */}
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              <span>{statistics ? formatNumber(statistics.likeCount) : '-'}</span>
            </div>
            
            {/* Icon Comment */}
            <div className="flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               <span>{statistics ? formatNumber(statistics.commentCount) : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}