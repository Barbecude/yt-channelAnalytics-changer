// lib/youtube-analytics.ts
// app/lib/youtube-analytics.ts
export async function getRevenue(accessToken: string, startDate?: string, endDate?: string): Promise<string> {
  // Hardcoded exchange rate for simple conversion (USD is usually the source currency)
  const EXCHANGE_RATE = 16200;

  try {
    const end = new Date();
    // Mundur 2 hari (delay wajar data revenue)
    end.setDate(end.getDate() - 2);
    const defaultEndDate = end.toISOString().split("T")[0];
    const defaultStartDate = "2021-01-01";

    // Params for YouTube Analytics API
    const params = new URLSearchParams({
      ids: "channel==MINE",
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate,
      metrics: "estimatedRevenue",
      dimensions: "day",
    });

    const res = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    // 1. Hitung total raw (kemungkinan dalam USD, karena angkanya kecil)
    const totalRaw = data.rows?.reduce((acc: number, curr: any[]) => acc + (curr[1] || 0), 0) || 0;

    // 2. Konversi ke IDR
    const totalIDR = totalRaw * EXCHANGE_RATE;

    // 3. Format hasil konversi
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      // FIX: Menggunakan 'code' untuk menampilkan IDR, bukan 'symbol' (Rp)
      currencyDisplay: 'code',
    }).format(totalIDR);

  } catch (error) {
    console.error("Revenue Error:", error);
    return "IDR 0"; // Mengubah default error return ke IDR
  }
}

export async function getGeoAnalytics(accessToken: string, startDate?: string, endDate?: string) {
  if (!accessToken) return [];

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1); // Data 1 tahun terakhir

  const defaultStartDate = start.toISOString().split('T')[0];
  const defaultEndDate = end.toISOString().split('T')[0];

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `ids=channel==MINE&` +
    `startDate=${startDate || defaultStartDate}&` +
    `endDate=${endDate || defaultEndDate}&` +
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
export async function getTotalViewsAnalytics(accessToken: string, startDate?: string, endDate?: string) {


  // Cek kalau token kosong, langsung stop
  if (!accessToken) return [];

  // Set rentang waktu: 1 Tahun ke belakang
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);

  const defaultStartDate = formatDate(start);
  const defaultEndDate = formatDate(end);

  // Request ke YouTube Analytics API
  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `ids=channel==MINE&` +
    `startDate=${startDate || defaultStartDate}&` +
    `endDate=${endDate || defaultEndDate}&` +
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

export async function getVideoAnalytics(accessToken: string, videoId: string, startDate?: string, endDate?: string) {
  if (!accessToken) return null;

  // GANTI METRIC: Hapus annotationClickThroughRate, ganti jadi averageViewPercentage
  const metrics = "averageViewDuration,averageViewPercentage";

  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = "2020-01-01";

  const url = `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `ids=channel==MINE&` +
    `metrics=${metrics}&` +
    `startDate=${startDate || defaultStartDate}&endDate=${endDate || defaultEndDate}&` +
    `filters=video==${videoId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();

  // --- DEBUGGING: TAMBAHKAN INI ---
  // Lihat terminal VSCode kamu saat refresh halaman
  if (data.error) {
    console.error("🔥 YOUTUBE ANALYTICS ERROR:", JSON.stringify(data.error, null, 2));
    return { averageViewDuration: 0, clickRatio: 0 };
  }

  if (!data.rows || data.rows.length === 0) {
    console.warn("⚠️ DATA KOSONG (Mungkin video baru upload < 48 jam?) ID:", videoId);
    return { averageViewDuration: 0, clickRatio: 0 };
  }
  // --------------------------------

  // Format return
  // averageViewPercentage biasanya return angka 0-100 (misal 45.5)
  // Kita bagi 100 biar jadi desimal (0.455) agar sesuai format persen di componentmu
  return {
    averageViewDuration: data.rows[0][0], // Detik
    clickRatio: data.rows[0][1] / 100     // Persen Retensi (pengganti CTR)
  };
}