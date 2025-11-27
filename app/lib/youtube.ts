import { channel } from "diagnostics_channel";

export async function getChannelStatistics() {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  // 1. Siapkan alamat tujuan (Endpoint API YouTube)
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;

  // 2. Pergi mengambil data
  const res = await fetch(url, { next: { revalidate: 60 } }); 
  // (revalidate: 60 artinya: data akan diperbarui tiap 60 detik, biar server ga capek)

  if (!res.ok) {
    throw new Error('Gagal mengambil data dari YouTube');
  }

  const data = await res.json();
  console.log(data);
  
  // 3. Kembalikan hanya bagian yang kita butuhkan
  return data.items[0].statistics;
 
}

export async function getRevenue(accessToken: string) {
  // 1. Tentukan rentang waktu (misal: 30 hari terakhir)
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // 2. Panggil API
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: startDate,
    endDate: endDate,
    metrics: "estimatedRevenue", 
    dimensions: "day",
    sort: "day",
  });

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return data;
}

export async function getMostPopularVideos() {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=viewCount&type=video&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();


  console.log("🔥 DATA POPULAR VIDEOS:", JSON.stringify(data, null, 2));

  return data.items;
}

export async function getVideoStatistics(videoIds: string[]) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const idsString = videoIds.join(','); 
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${idsString}&key=${API_KEY}`;
    
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
  
    return data.items || [];
}



export async function getComments(videoId: string) {
  const API_KEY = process.env.GOOGLE_API_KEY; // Pastikan simpan di .env.local
  const URL = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=3&key=${API_KEY}`;

  try {
    const res = await fetch(URL, { next: { revalidate: 3600 } }); // Cache 1 jam
    
    if (!res.ok) {
      throw new Error('Gagal fetch komentar');
    }

    const data = await res.json();

    // Mapping data API yang "ribet" menjadi format bersih untuk UI kita
    const cleanComments = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        name: snippet.authorDisplayName,
        date: new Date(snippet.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        }), 
        content: snippet.textOriginal, 
        imageUrl: snippet.authorProfileImageUrl,
      };
    });

    return cleanComments;

  } catch (error) {
    console.error("Error fetching comments:", error);
    return []; 
  }
}


// lib/analytics.ts

const formatDate = (date: Date) => date.toISOString().split('T')[0];

// 👇 UBAH DI SINI: Terima parameter accessToken
export async function getTotalViewsAnalytics(accessToken: string) {


  // Cek kalau token kosong, langsung stop
  if (!accessToken) return [];

  // Set rentang waktu: 1 Tahun ke belakang
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);

  const startDate = formatDate(start);
  const endDate = formatDate(end);

  // Request ke YouTube Analytics API
const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` + 
    `ids=channel==MINE&` + 
    `startDate=${startDate}&` + 
    `endDate=${endDate}&` + 
    `metrics=views&` + 
    `dimensions=day&` +  // 👈 UBAH DARI 'month' JADI 'day'
    `sort=day`,
    {
      headers: {
        // 👇 GUNAKAN TOKEN DARI PARAMETER
        Authorization: `Bearer ${accessToken}`, 
        Accept: 'application/json',
      },
      // Cache dimatikan atau pendek saja karena ini data sensitif per user
      next: { revalidate: 0 } 
    }
  );

  const data = await res.json();

  const chartData = data.rows?.map((row: any) => {
    return {
      date: row[0], 
      views: row[1]
    };
  }) || [];

  return chartData;
  
}

export async function getRecentVideos(maxResults = 9) {
  // Ganti CHANNEL_ID dengan ID channelmu
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID; 
  const API_KEY = process.env.YOUTUBE_API_KEY;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`,
    { next: { revalidate: 3600 } } // Cache 1 jam
  );

  if (!res.ok) throw new Error("Failed to fetch recent videos");
  
  const data = await res.json();
  return data.items; // Mengembalikan array video mentah
}