'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useChannel } from "@/app/context/ChannelContext";
import { Search, X } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  subscribers: number;
  profileImage: string;
  description?: string;
}

export default function AuthProfile() {
  const { data: session } = useSession();
  const { setChannelId, setChannelName } = useChannel();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowPopup(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-channels?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.items) {
        setSearchResults(data.items);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error searching channels:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer (500ms delay)
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    performSearch(searchQuery);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    setChannelId(channel.id);
    setChannelName(channel.name);
    setSearchQuery("");
    setSearchResults([]);
    setShowPopup(false);

    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="border border-xs border-gray-200 p-5 rounded-lg flex flex-col gap-3 items-start">
      
      <form onSubmit={handleSearch} className="flex gap-2 w-full relative">
        <input 
          type="text" 
          placeholder="Search channel..." 
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
        >
          <Search size={16} />
          Search
        </button>

        {/* Search Results Popup */}
        {showPopup && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition flex gap-3 items-start"
                >
                  {/* Channel Profile Image */}
                  {channel.profileImage && (
                    <img
                      src={channel.profileImage}
                      alt={channel.name}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                    />
                  )}
                  
                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {channel.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatSubscribers(channel.subscribers)} subscribers
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Close popup button */}
        {showPopup && (
          <button
            type="button"
            onClick={() => setShowPopup(false)}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* 2. Kondisional Auth: Cek session hanya untuk bagian user/login */}
      <div className="flex flex-col gap-2 w-full">
        {session ? (
          // TAMPILAN JIKA SUDAH LOGIN
          <div className="flex items-center justify-between w-full mt-2">
            <p className="text-sm">Halo, <strong>{session.user?.name}</strong>! 👋</p>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded-lg py-1 px-3 transition cursor-pointer"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        ) : (
          // TAMPILAN JIKA BELUM LOGIN
          <div className="mt-2">
            <button
              onClick={() => signIn("google")}
              className="
                flex items-center gap-2 max-w-max
                px-4 py-2 
                rounded-lg 
                border border-gray-200 
                shadow-xs
                bg-white text-black text-sm
                font-medium
                hover:bg-gray-50
                transition
                cursor-pointer
                w-full justify-center
              "
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-4 h-4"
              />
              Sign in with Google
            </button>
          </div>
        )}
      </div>

    </div>
  );
}