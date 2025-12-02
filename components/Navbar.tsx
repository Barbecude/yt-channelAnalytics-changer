'use client';

import { Search, Bell, HelpCircle, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChannel } from "@/app/context/ChannelContext";
import { useSidebar } from "@/app/context/SidebarContext";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { usePathname } from "next/navigation";

interface Channel {
    id: string;
    name: string;
    subscribers: number;
    profileImage: string;
    description?: string;
}

type TimeRange = '24 hours' | '7 days' | '30 days' | 'Lifetime';

export function Navbar() {
    const { setChannelId, setChannelName, timeRange, setTimeRange } = useChannel();
    const { toggleSidebar } = useSidebar();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const routeTitles: { [key: string]: string } = {
        '/': 'Overview',
        '/allvideos': 'All Videos',
        '/analytics': 'Deep Analytics',
        '/customize': 'Customize Channel',
        '/revenue': 'Revenue',
        '/settings': 'Settings',
    };

    const pageTitle = routeTitles[pathname] || 'Dashboard';

    const timeRanges: TimeRange[] = ['24 hours', '7 days', '30 days', 'Lifetime'];

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

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

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
        <nav className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="h-full px-6 flex items-center justify-between gap-4">

                {/* Left Section - Title & Time Range */}
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Toggle sidebar"
                        onClick={toggleSidebar}
                    >
                        <Menu size={20} className="text-gray-700" />
                    </button>

                    <div className="flex items-center gap-3">
                        <PageHeader
                            title={pageTitle}
                        />

                        {/* Time Range Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                {timeRange}
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {showTimeDropdown && (
                                <Card className="absolute top-full left-0 mt-1 shadow-lg z-50 p-1 min-w-[150px]">
                                    {timeRanges.map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => {
                                                setTimeRange(range);
                                                setShowTimeDropdown(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${timeRange === range
                                                ? 'bg-gray-100 text-gray-900 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Section - Channel Search */}
                <div className="flex-1 max-w-2xl relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search YouTube channel..."
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        {showPopup && searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPopup(false);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Search Results Popup */}
                    {showPopup && searchResults.length > 0 && (
                        <Card className="absolute w-full top-full left-0 mt-2 shadow-lg z-50 p-0 overflow-hidden">
                            <div className="max-h-96 overflow-y-auto">
                                {searchResults.map((channel) => (
                                    <button
                                        key={channel.id}
                                        onClick={() => handleChannelSelect(channel)}
                                        className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition flex gap-3 items-center"
                                    >
                                        {channel.profileImage && (
                                            <img
                                                src={channel.profileImage}
                                                alt={channel.name}
                                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                                            />
                                        )}

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
                        </Card>
                    )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2">

                </div>

            </div>
        </nav>
    );
}
