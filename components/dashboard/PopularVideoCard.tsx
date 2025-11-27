import Image from 'next/image';
import { BarChart2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function PopularVideoCard({ video, formatNumber }: any) {
  // --- BAGIAN 1: PERSIAPAN DATA ---
  // Kita bongkar dulu datanya di atas supaya di bawah tinggal panggil variabelnya.
  // Ini memudahkan pemula untuk melihat data apa saja yang tersedia.
  const snippet = video.snippet;
  const statistics = video.statistics;
  const comments = video.comments;
  
  // Buat URL Video dan Tanggal
  const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
  const formattedDate = new Date(snippet.publishedAt).toLocaleDateString('en-US', { 
    dateStyle: 'medium' 
  });

  // --- BAGIAN 2: TAMPILAN (UI) ---
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
      
      {/* Judul Section */}
      <h3 className="font-bold text-lg text-gray-900 mb-5">Popular Video</h3>
      
      {/* Container Utama (Flexbox): Kiri (Video) & Kanan (Statistik/Komen) */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* ========================== */}
        {/* KOLOM KIRI: Video & Stats  */}
        {/* ========================== */}
        <div className="flex-1 flex flex-col gap-4 max-w-md shrink-0">
          
          {/* 1. Gambar Thumbnail */}
          <a href={videoUrl} target="_blank" className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-xs group">
            <Image 
              src={snippet.thumbnails.high.url} 
              alt={snippet.title} 
              fill 
              className="object-cover" 
            />
          </a>
          
          {/* 2. Judul Video & Tanggal */}
          <div>
            <a href={videoUrl} target="_blank">
              <h4 className="font-bold text-base md:text-lg text-black leading-tight line-clamp-2 hover:underline">
                {snippet.title}
              </h4>
            </a>
            <p className="text-sm text-gray-500 mt-1">Uploaded on {formattedDate}</p>
          </div>

          {/* 3. Tiga Statistik Utama (Ditulis manual agar mudah diedit satu per satu) */}
          <div className="flex justify-between md:justify-start md:gap-16 pt-2">
            
            {/* -- Views -- */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <BarChart2 size={18} /> 
                <span>Views</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 leading-none">
                {formatNumber(statistics?.viewCount)}
              </span>
            </div>

            {/* -- Likes -- */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <ThumbsUp size={18} /> 
                <span>Likes</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 leading-none">
                {formatNumber(statistics?.likeCount)}
              </span>
            </div>

            {/* -- Comments Count -- */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <MessageSquare size={18} /> 
                <span>Comments</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 leading-none">
                {formatNumber(statistics?.commentCount)}
              </span>
            </div>

          </div>
        </div>

        {/* ================================== */}
        {/* KOLOM KANAN: Detail & List Komen */}
        {/* ================================== */}
        <div className='flex flex-col flex-1'>
          
          {/* 1. Baris Statistik Tambahan */}
          <div className="space-y-1 mb-5">
            <div className='flex justify-between'>
              <h5>Penayangan</h5> 
              <span>{formatNumber(statistics?.viewCount)}</span>
            </div>
            <div className='flex justify-between'>
              <h5>Rasio klik-tayang</h5> 
              <span>0%</span>
            </div>
            <div className='flex justify-between'>
              <h5>Rata-rata durasi</h5> 
              <span>8.41</span>
            </div>
          </div>

          {/* 2. List Komentar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Komentar Terbaru</h3>
            
            {/* Logic: Cek apakah ada komentar atau tidak */}
            <div className="flow-root">
              {comments && comments.length > 0 ? (
                <>
                  <ul className="-my-4 divide-y divide-gray-100">
                    {/* Looping data komentar langsung disini */}
                    {comments.map((comment: any) => (
                      <li key={comment.id} className="flex gap-x-4 py-4">
                        {/* Avatar User */}
                        <img 
                          className="h-10 w-10 flex-none rounded-full bg-gray-50 object-cover" 
                          src={comment.imageUrl} 
                          alt={comment.name} 
                        />
                        {/* Isi Komentar */}
                        <div className="flex-auto">
                          <div className="flex justify-between gap-x-4">
                            <h4 className="text-sm font-semibold text-gray-900">{comment.name}</h4>
                            <p className="text-xs text-gray-500">{comment.date}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Tombol View All */}
                  <div className="mt-6">
                    <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  
                      View all comments
                    </button>
                  </div>
                </>
              ) : (
                // Tampilan jika tidak ada komentar
                <p className="text-gray-500 text-sm">Tidak ada komentar.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}