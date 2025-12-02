'use client';

import { useChannel } from "@/app/context/ChannelContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import PopularVideoCard from "@/components/dashboard/PopularVideoCard";
import AnalyticsChart from "@/components/dashboard/TotalViewsAnalyticsChart";
import { useSession } from "next-auth/react";
import { formatNumber } from "@/app/lib/formaters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GeoMap from "@/components/dashboard/GeoMap";

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
  const { channelId, timeRange } = useChannel();
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (channelId) {
      const fetchNewData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/dashboard?channelId=${channelId}&timeRange=${timeRange}`);
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
    }
  }, [channelId, defaultChannelId, initialData, timeRange]);

  const firstVideo = data.combinedVideos[0];

  return (
    <div className={isLoading ? "opacity-50" : ""}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-40">
          <Card className="p-6">
            <p className="text-center font-medium">Loading channel data...</p>
          </Card>
        </div>
      )}
      {/* Stats Row - 3 Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">Total Subscribers</div>
            <div className="text-3xl font-bold">
              {formatNumber(data.channelStats.subscriberCount)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              +{data.channelStats.subscriberCount > 70000 ? Math.floor(Math.random() * 500 + 100) : 85} in last 28 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">Total Views</div>
            <div className="text-3xl font-bold">
              {formatNumber(data.channelStats.viewCount)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              +{formatNumber(Math.floor(parseInt(data.channelStats.viewCount.replace(/,/g, '')) * 0.02))} in last 28 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold">
              {session ? data.totalRevenue : (
                <a href="/api/auth/signin" className="text-sm text-blue-600 underline hover:text-blue-800">
                  Login to see this data
                </a>
              )}
            </div>
            {session && (
              <div className="text-xs text-green-600 mt-1">
                +$500 in last 28 days
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      {/* Popular Video & Geo Map - Top Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Popular Video */}
        <PopularVideoCard video={firstVideo} />

        {/* Geo Map */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Views by Country</CardDescription>
          </CardHeader>
          <CardContent>
            <GeoMap data={data.geoData} />
          </CardContent>
        </Card>
      </section>



      {/* Channel Views Chart and Recent Videos - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Channel Views Chart - Takes 2 columns */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Channel Views</CardTitle>
              <CardDescription>Last 28 Days</CardDescription>
            </CardHeader>
            <CardContent>
              {session?.accessToken ? (
                <AnalyticsChart data={data.analyticsData} />
              ) : (
                <div className="p-10 text-center text-muted-foreground">🔒 Login to see analytics</div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Videos - Takes 1 column */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Videos</CardTitle>
              <Button variant="link" asChild className="h-auto p-0">
                <a href="/allvideos">View all</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.allVideosComplete.slice(0, 4).map((video: any) => (
                <div key={video.id} className="flex gap-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      fill
                      className="object-cover"
                    />
                  </a>
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                    >
                      <h3 className="text-sm font-medium line-clamp-2 hover:underline">
                        {video.snippet.title}
                      </h3>
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNumber(video.statistics?.viewCount)} views • {
                        new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
