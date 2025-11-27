'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definisikan bentuk datanya
type ChannelContextType = {
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
};

// 2. Buat Context dengan nilai default null
const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

// 3. Buat Provider (Pembungkus)
export function ChannelProvider({ children }: { children: ReactNode }) {
  // Defaultnya ambil dari ENV, kalau tidak ada kosongkan
  const [activeChannelId, setActiveChannelId] = useState<string>(
    process.env.YOUTUBE_CHANNEL_ID || ''
  );

  return (
    <ChannelContext.Provider value={{ activeChannelId, setActiveChannelId }}>
      {children}
    </ChannelContext.Provider>
  );
}

// 4. Custom Hook biar gampang dipanggil di mana saja
export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}