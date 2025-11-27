import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    // Search channels by keyword
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=channel&` +
      `maxResults=3&` +
      `key=${API_KEY}`;

    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error('Failed to fetch from YouTube API');
    }

    const data = await res.json();

    // Extract channel IDs dari search results
    const channelIds = data.items
      ?.map((item: any) => item.snippet.channelId)
      .filter(Boolean) || [];

    if (channelIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch channel details (subscribers, profile image)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics&` +
      `id=${channelIds.join(',')}&` +
      `key=${API_KEY}`;

    const detailsRes = await fetch(detailsUrl);
    
    if (!detailsRes.ok) {
      throw new Error('Failed to fetch channel details');
    }

    const detailsData = await detailsRes.json();

    // Format hasil yang bagus untuk UI
    const formattedChannels = detailsData.items?.map((channel: any) => ({
      id: channel.id,
      name: channel.snippet.title,
      subscribers: parseInt(channel.statistics.subscriberCount) || 0,
      profileImage: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
      description: channel.snippet.description,
    })) || [];

    return NextResponse.json({
      items: formattedChannels,
    });
  } catch (error) {
    console.error('Search channels error:', error);
    return NextResponse.json(
      { error: 'Failed to search channels' },
      { status: 500 }
    );
  }
}
