// components/Sidebar.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChannel } from "@/app/context/ChannelContext";
import { useSidebar } from "@/app/context/SidebarContext";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useGithubStars } from "@/hooks/useGithubStars";
import { LayoutGrid, Server, Activity, Globe, BarChart3, Settings, LogOut, Github, Star, ExternalLink, Brush, ListVideo } from "lucide-react";

interface ChannelInfo {
  title: string;
  customUrl: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  subscriberCount: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { channelId } = useChannel();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannelInfo() {
      if (!channelId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/channel?channelId=${channelId}`);
        if (response.ok) {
          const data = await response.json();
          setChannelInfo(data);
        }
      } catch (error) {
        console.error('Error fetching channel info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChannelInfo();
  }, [channelId]);

  const formatSubscribers = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:sticky lg:top-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

      {/* 1. Profile Section */}
      <div className="p-4 mb-2 border-b border-gray-200">
        {loading ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ) : channelInfo ? (
          <div>
            <div className="flex items-center gap-3 px-2 mb-3">
              <img
                src={channelInfo.thumbnails.medium?.url || channelInfo.thumbnails.default?.url || 'https://avatar.vercel.sh/channel'}
                alt={channelInfo.title}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">{channelInfo.title}</span>
                <span className="text-xs text-gray-500">
                  {formatSubscribers(channelInfo.subscriberCount)} subscribers
                </span>
              </div>
            </div>

            {/* View Channel Button */}
            <a
              href={`https://www.youtube.com/channel/${channelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <ExternalLink size={14} />
              View Channel on YouTube
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500">Channel</span>
              <span className="text-xs text-gray-400">Loading...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">

        {/* 2. Navigation Section */}
        <div>
          <nav className="space-y-0.5">
            <NavItem href="/" icon={<LayoutGrid size={18} />} label="Overview" active={pathname === "/"} onClick={closeSidebar} />
            <NavItem href="/allvideos" icon={<ListVideo size={18} />} label="All Videos" active={pathname === "/allvideos"} onClick={closeSidebar} />
            {/* <NavItem href="/analytics" icon={<Activity size={18} />} label="Deep Analytics" active={pathname === "/analytics"} onClick={closeSidebar} /> */}
            <NavItem href="/customize" icon={<Brush size={18} />} label="Customize Channel" active={pathname === "/customize"} onClick={closeSidebar} />
            {/* <NavItem href="/revenue" icon={<BarChart3 size={18} />} label="Revenue" active={pathname === "/revenue"} onClick={closeSidebar} /> */}
          </nav>
        </div>

        {/* 3. Teams Section */}
        {/* <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 tracking-wider mb-2">
            Your Channels
          </h3>
          <div className="space-y-0.5">
            <TeamItem name="MrBeast" initial="M" />
            <TeamItem name="PewDiePie" initial="D" />
            <TeamItem name="Logan Paul" initial="L" />
          </div>
        </div> */}

      </div>
      <div className="p-3 border-t border-gray-200 mt-auto space-y-1">

        {/* GitHub Rate */}
        <Link
          href="https://github.com/yourusername/project"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Github size={18} />
            <span>Rate on GitHub</span>
          </div>
          {/* Star Count Badge */}
          <div className="flex items-center gap-1 bg-gray-200 px-1.5 py-0.5 rounded-md text-xs font-semibold group-hover:bg-gray-300 transition-colors">
            <Star size={10} className="fill-gray-600" />
            <span>12.5k</span>
          </div>
        </Link>

        {/* Settings (Moved here) */}
        {/* <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === "/settings"} onClick={closeSidebar} /> */}

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"

        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
    </>
  );
}

// Helper Component for Navigation Links
function NavItem({ href, icon, label, active = false, onClick }: { href: string; icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
      `}
    >
      <span className={active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

// Helper Component for Teams
function TeamItem({ name, initial }: { name: string; initial: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left">
      <div className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
        {initial}
      </div>
      {name}
    </button>
  );
}