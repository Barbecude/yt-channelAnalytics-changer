import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
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
import { ChannelProvider } from "@/app/context/ChannelContext";
import { DashboardWrapper } from "@/components/DashboardWrapper";
;

// --- Logic: Data Fetching ---
async function getDashboardData(channelId: string, accessToken?: string) {
  // --- TAHAP 1: Ambil data Channel & List Video ---
const [channelStats, totalRevenue, popularVideosRaw, analyticsData, geoData] = await Promise.all([
    getChannelStatistics(channelId),
    accessToken ? getRevenue(accessToken) : Promise.resolve(null), 
    getMostPopularVideos(channelId),
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
  const defaultChannelId = process.env.YOUTUBE_CHANNEL_ID || '';
  
  // 1. Ambil Data Dashboard (Channel, Popular, Chart) dengan default channel ID
  const { channelStats, totalRevenue, analyticsData, combinedVideos, geoData } = await getDashboardData(defaultChannelId, session?.accessToken);

  
  // 2. Ambil Data Recent Videos (Terpisah)
  const recentVideosRaw = await getRecentVideos(defaultChannelId);
  const allVideosComplete = await enrichVideosWithDetails(recentVideosRaw);

  const initialData = {
    channelStats,
    analyticsData,
    combinedVideos,
    geoData,
    totalRevenue,
    allVideosComplete,
  };

  return (
    <ChannelProvider initialChannelId={defaultChannelId}>
      <main>
        <h1 className="text-2xl font-bold mb-4">YouTube Dashboard 🚀</h1>
        <AuthProfile />
        <hr className="my-8" />
        <DashboardWrapper initialData={initialData} defaultChannelId={defaultChannelId} />
      </main>
    </ChannelProvider>
  );
}