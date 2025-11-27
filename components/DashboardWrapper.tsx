'use client';

import { useChannel } from "@/app/context/ChannelContext";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PopularVideoCard from "@/components/dashboard/PopularVideoCard";
import AnalyticsChart from "@/components/dashboard/TotalViewsAnalyticsChart";
import LatestVideoCard from "@/components/dashboard/LatestVideoCard";
import GeoMap from "@/components/dashboard/GeoMap";
import { useSession } from "next-auth/react";

interface DashboardData {
  channelStats: any;
  analyticsData: any;
  combinedVideos: any[];
  geoData: any[];
  totalRevenue: any;
  allVideosComplete: any[];
}

interface DashboardWrapperProps {
  initialData: DashboardData;
  defaultChannelId: string;
}

export function DashboardWrapper({ initialData, defaultChannelId }: DashboardWrapperProps) {
  const { channelId } = useChannel();
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Jika channel ID berbeda dari default, fetch data baru
    if (channelId && channelId !== defaultChannelId) {
      const fetchNewData = async () => {
        setIsLoading(true);
        try {
          // Fetch data untuk channel baru
          const response = await fetch(`/api/dashboard?channelId=${channelId}`);
          
          if (response.ok) {
            const newData = await response.json();
            setData(newData);
          }
        } catch (error) {
          console.error("Error fetching new channel data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchNewData();
    } else if (channelId === defaultChannelId) {
      // Reset ke data awal
      setData(initialData);
      setIsLoading(false);
    }
  }, [channelId, defaultChannelId, initialData]);

  return (
    <div className={isLoading ? "opacity-50" : ""}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-40">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-center text-gray-700 font-medium">Loading channel data...</p>
          </div>
        </div>
      )}

      {/* Bagian Statistik Utama */}
      <section
        className="
          grid grid-cols-2
          sm:flex sm:flex-row
          bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden
          divide-y divide-gray-200 sm:divide-y-0 sm:divide-x mb-6
        "
      >
        <StatCard title="Subscribers" value={data.channelStats.subscriberCount} />
        <StatCard title="Total Views" value={data.channelStats.viewCount} />
        <StatCard title="Video Uploaded" value={data.channelStats.videoCount} />
        <StatCard 
          title="Total Revenue" 
          value={
            session ? (
              data.totalRevenue 
            ) : (
              <a href="/api/auth/signin" className="text-sm text-blue-600 underline hover:text-blue-800">
                Login to see data
              </a>
            )
          } 
        />
      </section>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mb-8">
        {/* Bagian Popular Videos */}
        <section>  
          {data.combinedVideos.map((video: any) => (
            <PopularVideoCard 
              key={video.id}
              video={video} 
              privateStats={video}
            />
          ))}
        </section>

        {/* Kolom Kiri: Peta Demografi */}
        <section className="p-5 border border-gray-100 shadow-xs rounded-xl bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Views Based Countries</h2>
          
          {session?.accessToken ? (
            <GeoMap data={data.geoData} />
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
            <AnalyticsChart data={data.analyticsData} />
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

          <div className="grid sm:grid-cols-3 gap-4">
            {data.allVideosComplete.map((video) => (
              <LatestVideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
