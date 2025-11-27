import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { 
  getChannelStatistics, 
  getMostPopularVideos, 
  getVideoStatistics, 
  getComments, 
  getTotalViewsAnalytics,
  // getRecentVideos
} from "./lib/youtube";

import { enrichVideosWithDetails } from "./lib/youtube.helpers";

// Components
import AuthProfile from "@/components/AuthProfile";
import StatCard from "@/components/dashboard/StatCard";
import PopularVideoCard from "@/components/dashboard/PopularVideoCard";
import AnalyticsChart from "@/components/dashboard/TotalViewsAnalyticsChart";

// --- Utility: Formatter Angka ---
const formatNumber = (num: string | number) => {
  const val = typeof num === 'string' ? parseInt(num) : num;
  if (isNaN(val)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: "compact", 
    compactDisplay: "short", 
    maximumFractionDigits: 1
  }).format(val);
};

// --- Logic: Data Fetching ---
async function getDashboardData(accessToken?: string) {
  // 1. Fetch Data Utama (Channel & Popular Videos) + Analytics (jika login) secara paralel
  const [channelStats, popularVideos, analyticsData] = await Promise.all([
    getChannelStatistics(),
    getMostPopularVideos(),
    accessToken ? getTotalViewsAnalytics(accessToken) : Promise.resolve([])
  ]);

  if (!popularVideos || popularVideos.length === 0) {
    return { channelStats, analyticsData, combinedVideos: [] };
  }

  // 2. Fetch Detail Video (Stats & Comments) berdasarkan Popular Videos
  const videoIds = popularVideos.map((v: any) => v.id.videoId);
  const [videoStats, videoComments] = await Promise.all([
    getVideoStatistics(videoIds),
    Promise.all(videoIds.map((id: string) => getComments(id)))
  ]);

  // 3. Gabungkan Data (Merge) agar siap dirender
  // Menggunakan Map untuk akses O(1) yang lebih cepat daripada find()
  const statsMap = new Map(videoStats.map((s: any) => [s.id, s.statistics]));

  const combinedVideos = popularVideos.map((video: any, index: number) => ({
    ...video,
    statistics: statsMap.get(video.id.videoId),
    comments: videoComments[index]
  }));

  return { channelStats, analyticsData, combinedVideos };
}

// --- Main Component ---
export default async function Home() {
  const session: any = await getServerSession(authOptions);
  
  // Kode di dalam komponen jadi sangat bersih 👇
  const { channelStats, analyticsData, combinedVideos } = await getDashboardData(session?.accessToken);
  // const recentVideosRaw = await getRecentVideos();
  // const allVideosComplete = await enrichVideosWithDetails(recentVideosRaw);
  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">YouTube Dashboard 🚀</h1>
      <AuthProfile />
      <hr className="my-8" />

      {/* Bagian Statistik Utama */}
      <section className="flex flex-col sm:flex-row bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-200 sm:divide-y-0 sm:divide-x mb-6">
        <StatCard title="Subscribers" value={formatNumber(channelStats.subscriberCount)} />
        <StatCard title="Total Views" value={formatNumber(channelStats.viewCount)} />
        <StatCard title="Video Uploaded" value={formatNumber(channelStats.videoCount)} />
      </section>

      {/* Bagian Popular Videos */}
      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Popular Videos</h2>
        {combinedVideos.map((video: any) => (
          <PopularVideoCard 
            key={video.id.videoId} 
            video={video} 
            formatNumber={formatNumber} 
          />
        ))}
      </section>

      {/* Bagian Analytics Chart (Conditional Rendering) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Analytics Overview</h2>
        {session?.accessToken ? (
          <AnalyticsChart data={analyticsData} />
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">🔒 Login dengan Google untuk melihat Grafik Views Historis</p>
          </div>
        )}
      </section>

      <section>
        {/* <div className="grid grid-cols-3 gap-4">
      {allVideosComplete.map(video => (
        // Component Card yang sama bisa dipakai
        <VideoCard key={video.id} data={video} /> 
      ))}
    </div> */}
      </section>
    </main>
  );
}