import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        // Fetch channel details from YouTube API
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`;

        const response = await fetch(url, { next: { revalidate: 3600 } });

        if (!response.ok) {
            throw new Error('Failed to fetch channel info from YouTube API');
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return NextResponse.json(
                { error: 'Channel not found' },
                { status: 404 }
            );
        }

        const channel = data.items[0];

        // Extract relevant information
        const channelInfo = {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            customUrl: channel.snippet.customUrl || '',
            thumbnails: channel.snippet.thumbnails,
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount,
        };

        return NextResponse.json(channelInfo);
    } catch (error) {
        console.error('Error fetching channel info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch channel info' },
            { status: 500 }
        );
    }
}
