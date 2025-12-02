'use client';

import { SessionProvider } from "next-auth/react";
import { ChannelProvider } from "@/app/context/ChannelContext";
import { SidebarProvider } from "@/app/context/SidebarContext";

export function Providers({ children, initialChannelId }: { children: React.ReactNode; initialChannelId?: string }) {
  return (
    <SessionProvider>
      <ChannelProvider initialChannelId={initialChannelId || ''}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ChannelProvider>
    </SessionProvider>
  );
}