import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  getChannelStatistics,
  getMostPopularVideos,
  enrichVideosWithDetails,
  getRecentVideos,
} from '@/app/lib/youtube';
import {
  getRevenue,
  getGeoAnalytics,
  getTotalViewsAnalytics,
  getVideoAnalytics,
} from '@/app/lib/youtube-analytics';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json(
      { error: 'Channel ID is required' },
      { status: 400 }
    );
  }

  try {
    const session: any = await getServerSession(authOptions);

    // Fetch data untuk channel yang dipilih
    const [channelStats, totalRevenue, popularVideosRaw, analyticsData, geoData] = await Promise.all([
      getChannelStatistics(channelId),
      session?.accessToken ? getRevenue(session.accessToken) : Promise.resolve(null),
      getMostPopularVideos(channelId),
      session?.accessToken ? getTotalViewsAnalytics(session.accessToken) : Promise.resolve([]),
      session?.accessToken ? getGeoAnalytics(session.accessToken) : Promise.resolve([]),
    ]);

    // Get first video ID
    const firstVideo = popularVideosRaw?.[0];
    let firstVideoId = '';

    if (firstVideo) {
      if (typeof firstVideo.id === 'object' && firstVideo.id !== null) {
        firstVideoId = firstVideo.id.videoId;
      } else {
        firstVideoId = firstVideo.id;
      }
    }

    // Fetch video analytics
    const [videoAnalytics, combinedVideos] = await Promise.all([
      session?.accessToken && firstVideoId
        ? getVideoAnalytics(session.accessToken, firstVideoId)
        : Promise.resolve(null),
      enrichVideosWithDetails(popularVideosRaw),
    ]);

    // Combine analytics with first video
    if (combinedVideos.length > 0 && videoAnalytics) {
      (combinedVideos[0] as any).privateStats = videoAnalytics;
    }

    // Fetch recent videos
    const recentVideosRaw = await getRecentVideos(channelId);
    const allVideosComplete = await enrichVideosWithDetails(recentVideosRaw);

    return NextResponse.json({
      channelStats,
      analyticsData,
      combinedVideos,
      geoData,
      totalRevenue,
      allVideosComplete,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
