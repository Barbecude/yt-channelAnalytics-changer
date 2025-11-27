// lib/youtube-helpers.ts
import { getVideoStatistics, getComments } from "./youtube";

export async function enrichVideosWithDetails(rawVideos: any[]) {
  if (!rawVideos || rawVideos.length === 0) return [];

  // 1. Normalisasi ID: Kadang YouTube kasih ID berupa object (id.videoId), kadang string (id)
  const videoIds = rawVideos.map((v: any) => 
    typeof v.id === 'string' ? v.id : v.id.videoId
  );

  // 2. Fetch data tambahan secara paralel
  const [videoStats, videoComments] = await Promise.all([
    getVideoStatistics(videoIds),
    Promise.all(videoIds.map((id: string) => getComments(id)))
  ]);

  // 3. Buat Map untuk pencarian data O(1)
  const statsMap = new Map(videoStats.map((s: any) => [s.id, s.statistics]));

  // 4. Gabungkan (Merge)
  return rawVideos.map((video: any, index: number) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    return {
      ...video,
      id: videoId, // Kita standardisasi ID jadi string di sini
      statistics: statsMap.get(videoId),
      comments: videoComments[index] || []
    };
  });
}