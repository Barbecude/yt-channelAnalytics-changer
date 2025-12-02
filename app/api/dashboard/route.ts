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
  const timeRange = searchParams.get('timeRange') || 'Lifetime';

  if (!channelId) {
    return NextResponse.json(
      { error: 'Channel ID is required' },
      { status: 400 }
    );
  }

  try {
    const session: any = await getServerSession(authOptions);

    // Calculate start and end dates based on timeRange
    const endDate = new Date();
    const startDate = new Date();

    if (timeRange === 'Last 24 hours') {
      startDate.setDate(endDate.getDate() - 1);
    } else if (timeRange === '7 days') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === '30 days') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      // Lifetime (default to 2010-01-01 or similar)
      startDate.setFullYear(2010, 0, 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch data untuk channel yang dipilih
    const [channelStats, totalRevenue, popularVideosRaw, analyticsData, geoData] = await Promise.all([
      getChannelStatistics(channelId),
      session?.accessToken ? getRevenue(session.accessToken, startDateStr, endDateStr) : Promise.resolve(null),
      getMostPopularVideos(channelId),
      session?.accessToken ? getTotalViewsAnalytics(session.accessToken, startDateStr, endDateStr) : Promise.resolve([]),
      session?.accessToken ? getGeoAnalytics(session.accessToken, startDateStr, endDateStr) : Promise.resolve([]),
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
        ? getVideoAnalytics(session.accessToken, firstVideoId, startDateStr, endDateStr)
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
