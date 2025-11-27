import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Eye } from "lucide-react";
//public data
import { 
  getChannelStatistics, 
  getMostPopularVideos, 
  enrichVideosWithDetails,
  getRecentVideos
} from "./lib/youtube";

//private data
import {getRevenue, getGeoAnalytics, getTotalViewsAnalytics, getVideoAnalytics} from "./lib/youtube-analytics"

// Components
import AuthProfile from "@/components/AuthProfile";
import StatCard from "@/components/dashboard/StatCard";
import PopularVideoCard from "@/components/dashboard/PopularVideoCard";
import AnalyticsChart from "@/components/dashboard/TotalViewsAnalyticsChart";
import LatestVideoCard from "@/components/dashboard/LatestVideoCard";
import GeoMap from "@/components/dashboard/GeoMap";
import { ChannelProvider } from "@/app/context/ChannelContext";

// --- Logic: Data Fetching ---
async function getDashboardData(accessToken?: string) {
  // --- TAHAP 1: Ambil data Channel & List Video ---
const [channelStats, totalRevenue, popularVideosRaw, analyticsData, geoData] = await Promise.all([
    getChannelStatistics(),
    // 👇 UBAH INI: return string "Rp 0" agar konsisten dengan tipe data getRevenue
    accessToken ? getRevenue(accessToken) : Promise.resolve("Rp 0"), 
    getMostPopularVideos(),
    accessToken ? getTotalViewsAnalytics(accessToken) : Promise.resolve([]),
    accessToken ? getGeoAnalytics(accessToken) : Promise.resolve([]) 
  ]);

  // --- TAHAP 2: Siapkan ID Video Populer Pertama (PERBAIKAN DISINI) ---
  const firstVideo = popularVideosRaw?.[0];
  let firstVideoId = "";

  if (firstVideo) {
    // Cek apakah ID-nya berbentuk Object (Search API) atau String (Video API)
    if (typeof firstVideo.id === 'object' && firstVideo.id !== null) {
       firstVideoId = firstVideo.id.videoId; // Ambil .videoId
    } else {
       firstVideoId = firstVideo.id; // Ambil string langsung
    }
  }

  // --- TAHAP 3: Fetch Detail Video & Analytics Video secara Paralel ---
  const [videoAnalytics, combinedVideos] = await Promise.all([
    // Ambil Analytics Video (Cuma kalau ada token & ada videonya)
    // firstVideoId sekarang dijamin string bersih, bukan object
    (accessToken && firstVideoId) 
      ? getVideoAnalytics(accessToken, firstVideoId) 
      : Promise.resolve(null),

    // Sekalian ambil detail komentar, dll (enrich)
    enrichVideosWithDetails(popularVideosRaw)
  ]);

  // --- TAHAP 4: Gabungkan Analytics ke dalam Video Pertama ---
  if (combinedVideos.length > 0 && videoAnalytics) {
    (combinedVideos[0] as any).privateStats = videoAnalytics;
    console.log(videoAnalytics)
  }

  return { channelStats, analyticsData, combinedVideos, geoData, totalRevenue };
}
     

// --- Main Component ---
export default async function Home() {
  const session: any = await getServerSession(authOptions);
  
  // 1. Ambil Data Dashboard (Channel, Popular, Chart)
  const { channelStats, totalRevenue, analyticsData, combinedVideos, geoData } = await getDashboardData(session?.accessToken);
  console.log(totalRevenue)
  
  // 2. Ambil Data Recent Videos (Terpisah)
  const recentVideosRaw = await getRecentVideos();
  const allVideosComplete = await enrichVideosWithDetails(recentVideosRaw);

  return (
    <ChannelProvider>
      <main>
        <h1 className="text-2xl font-bold mb-4">YouTube Dashboard 🚀</h1>
        <AuthProfile />
        <hr className="my-8" />

        {/* Bagian Statistik Utama */}
        <section
          className="
            grid grid-cols-2
            sm:flex sm:flex-row
            bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden
            divide-y divide-gray-200 sm:divide-y-0 sm:divide-x mb-6
          "
        >
          <StatCard title="Subscribers" value={channelStats.subscriberCount} />
          <StatCard title="Total Views" value={channelStats.viewCount} />
          <StatCard title="Video Uploaded" value={channelStats.videoCount} />
          <StatCard title="Total Revenue" value={totalRevenue} />
        </section>


      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mb-8">
        {/* Bagian Popular Videos */}
        <section>  
          {combinedVideos.map((video: any) => (
            <PopularVideoCard 
              key={video.id} // ID sekarang sudah bersih (string)
              video={video} 
              privateStats={video}
            />
          ))}
        </section>

        {/* Kolom Kiri: Peta Demografi */}
        <section className="p-5 border border-gray-100 shadow-xs rounded-xl bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Views Based Countries</h2>
          
          {session?.accessToken ? (
              <GeoMap data={geoData} />
          ) : (
              <div className="p-10 text-center text-gray-400">🔒 Login with your YouTube account to see this Deep Analytics</div>
          )}
        </section>
      </div>


        {/* Grid: Analytics Chart & Latest Video */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5">
          {/* Kolom Kiri: Chart */}
          <section className="md:col-span-5">
            {session?.accessToken ? (
              <AnalyticsChart data={analyticsData} />
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">🔒 Login with your YouTube account to see this Deep Analytics</p>
              </div>
            )}
          </section>

          {/* Kolom Kanan: Latest Videos */}
          <section className="md:col-span-7 p-5 border border-gray-300 rounded-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-700">Latest Video</h2>
              <button className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <Eye size={16}/>
                  View all videos
              </button>
            </div>

              <div className="grid sm:grid-cols-3 gap-4 ">
              {allVideosComplete.map((video) => (
                <LatestVideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        </div>


      </main>
    </ChannelProvider>
  );
}