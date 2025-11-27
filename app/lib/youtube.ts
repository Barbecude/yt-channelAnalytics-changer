
  const API_KEY = process.env.GOOGLE_API_KEY 
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID 


export async function getChannelStatistics() {

  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;

  // 2. Pergi mengambil data
  const res = await fetch(url, { next: { revalidate: 60 } }); 
  // (revalidate: 60 artinya: data akan diperbarui tiap 60 detik, biar server ga capek)

  if (!res.ok) {
    throw new Error('Gagal mengambil data dari YouTube');
  }

  const data = await res.json();
 
  
  // 3. Kembalikan hanya bagian yang kita butuhkan
  return data.items[0].statistics;
 
}



export async function getMostPopularVideos() {

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=viewCount&type=video&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();


  // console.log("🔥 DATA POPULAR VIDEOS:", JSON.stringify(data, null, 2));

  return data.items;
}

export async function getVideoStatistics(videoIds: string[]) {
    const idsString = videoIds.join(','); 
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${idsString}&key=${API_KEY}`;
    
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
  
    return data.items || [];
}



export async function getComments(videoId: string) {
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

export async function getRecentVideos() {

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=9&type=video`,
    { next: { revalidate: 3600 } } // Cache 1 jam
  );

  if (!res.ok) throw new Error("Failed to fetch recent videos");
  
  const data = await res.json();
  return data.items; // Mengembalikan array video mentah
}



// 2. Fungsi Enricher
export interface RawVideo {
  id: string | { videoId: string }; // Handle ID string atau object
  snippet?: any;
  [key: string]: any;
}

export interface EnrichedVideo extends RawVideo {
  id: string; 
  statistics: any; 
  comments: any[];
}

// 2. Fungsi Enricher (Penyatu Data)
export async function enrichVideosWithDetails(rawVideos: RawVideo[]): Promise<EnrichedVideo[]> {
  // Fail fast
  if (!rawVideos || rawVideos.length === 0) return [];

  // A. Normalisasi ID
  const videoIds = rawVideos.map((v) => 
    typeof v.id === 'string' ? v.id : v.id.videoId
  );

  // B. Fetch stats & comments secara PARALEL
  const [videoStats, videoComments] = await Promise.all([
    getVideoStatistics(videoIds), 
    Promise.all(videoIds.map((id) => getComments(id)))
  ]);

  // C. Buat Map (Optimasi O(1))
  const statsMap = new Map(videoStats.map((s: any) => [s.id, s.statistics]));

  // D. Gabungkan
  return rawVideos.map((video, index) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    
    return {
      ...video,
      id: videoId, 
      statistics: statsMap.get(videoId) || null,
      comments: videoComments[index] || []
    };
  });
}