'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChannelContextType {
  channelId: string;
  setChannelId: (id: string) => void;
  channelName: string;
  setChannelName: (name: string) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children, initialChannelId }: { children: ReactNode; initialChannelId: string }) {
  const [channelId, setChannelId] = useState(initialChannelId);
  const [channelName, setChannelName] = useState('');

  return (
    <ChannelContext.Provider value={{ channelId, setChannelId, channelName, setChannelName }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within ChannelProvider');
  }
  return context;
}
