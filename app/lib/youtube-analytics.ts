// lib/youtube-analytics.ts

export async function getGeoAnalytics(accessToken: string) {
  if (!accessToken) return [];

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1); // Data 1 tahun terakhir

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` + 
    `ids=channel==MINE&` + 
    `startDate=${start.toISOString().split('T')[0]}&` + 
    `endDate=${end.toISOString().split('T')[0]}&` + 
    `metrics=views&` + 
    `dimensions=country&` +  // 👈 Kuncinya di sini (Grouping by Country)
    `sort=-views&` +         // Urutkan dari yang terbanyak
    `maxResults=200`,        // Ambil data semua negara
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, 
        Accept: 'application/json',
      },
      next: { revalidate: 93600 } 
    }
  );

  const data = await res.json();

  // Format data biar enak dipakai di Peta
  // Output: [ { id: "ID", value: 5000 }, { id: "US", value: 3000 } ]
  return data.rows?.map((row: any) => ({
    id: row[0],   // Kode Negara (misal: "ID", "US")
    value: row[1] // Jumlah Views
  })) || [];
}

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