'use client';

import { useEffect, useState } from "react";
import { useChannel } from "@/app/context/ChannelContext";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, Lock, DollarSign, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";


export default function AllVideosPage() {
    const { channelId, timeRange } = useChannel();
    const [allVideos, setAllVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalVideos, setTotalVideos] = useState(0);
    const videosPerPage = 10;

    // Fetch videos for current page
    useEffect(() => {
        const fetchVideos = async () => {
            if (!channelId) return;

            setLoading(true);
            try {
                const url = `/api/videos?channelId=${channelId}&timeRange=${timeRange}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }

                const data = await response.json();
                setAllVideos(data.videos || []);
                setTotalVideos(data.videos?.length || 0);
            } catch (error) {
                console.error('Error fetching videos:', error);
                setAllVideos([]);
                setTotalVideos(0);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
        setCurrentPage(1); // Reset to first page when channel or timeRange changes
    }, [channelId, timeRange]);

    const handleEdit = (videoId: string) => {
        // TODO: Implement edit functionality
        console.log('Edit video:', videoId);
    };

    // Calculate pagination
    const totalPages = Math.ceil(totalVideos / videosPerPage);
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const currentVideos = allVideos.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate range around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }

            // Add pages around current page
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div>
            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="text-gray-500 text-lg mt-4">Loading videos...</p>
                </div>
            )}

            {/* Videos Table */}
            {!loading && (
                <>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Video</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                        <TableHead className="w-[120px]">Views</TableHead>
                                        <TableHead className="w-[120px]">Likes</TableHead>
                                        <TableHead className="w-[120px]">Comments</TableHead>
                                        <TableHead className="w-[120px]">Published</TableHead>
                                        <TableHead className="w-[200px]">Status</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentVideos.map((video: any, index: number) => {
                                        const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
                                        const thumbnail = video.snippet?.thumbnails?.default?.url || video.snippet?.thumbnails?.medium?.url;
                                        const title = video.snippet?.title || 'Untitled Video';
                                        const publishedAt = new Date(video.snippet?.publishedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        });

                                        return (
                                            <TableRow key={videoId}>
                                                {/* Thumbnail */}
                                                <TableCell>
                                                    <a
                                                        href={`https://www.youtube.com/watch?v=${videoId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-200">
                                                            {thumbnail && (
                                                                <Image
                                                                    src={thumbnail}
                                                                    alt={title}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="80px"
                                                                />
                                                            )}
                                                        </div>
                                                    </a>
                                                </TableCell>

                                                {/* Title */}
                                                <TableCell>
                                                    <a
                                                        href={`https://www.youtube.com/watch?v=${videoId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium hover:text-blue-600 line-clamp-2"
                                                    >
                                                        {title}
                                                    </a>
                                                    <p className="text-xs text-gray-500">{video.snippet?.description}</p>
                                                </TableCell>

                                                {/* Views */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Eye className="w-4 h-4 text-gray-500" />
                                                        <span>{parseInt(video.statistics?.viewCount || 0).toLocaleString()}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Likes */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <ThumbsUp className="w-4 h-4 text-gray-500" />
                                                        <span>{parseInt(video.statistics?.likeCount || 0).toLocaleString()}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Comments */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                                        <span>{parseInt(video.statistics?.commentCount || 0).toLocaleString()}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Published Date */}
                                                <TableCell className="text-sm text-gray-600">
                                                    {publishedAt}
                                                </TableCell>

                                                {/* Status Badges */}
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {/* Visibility */}
                                                        {video.status?.privacyStatus === 'public' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <Eye className="w-3 h-3" />
                                                                Public
                                                            </span>
                                                        )}
                                                        {video.status?.privacyStatus === 'unlisted' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                <EyeOff className="w-3 h-3" />
                                                                Unlisted
                                                            </span>
                                                        )}
                                                        {video.status?.privacyStatus === 'private' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <Lock className="w-3 h-3" />
                                                                Private
                                                            </span>
                                                        )}

                                                        {/* Monetization */}
                                                        {Math.random() > 0.3 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <DollarSign className="w-3 h-3" />
                                                                Monetized
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                <DollarSign className="w-3 h-3" />
                                                                Not Monetized
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(videoId)}
                                                        className="h-8 cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination Controls */}
                    {totalVideos > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            {/* Results info */}
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalVideos)} of {totalVideos} videos
                            </div>

                            {/* Pagination buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="h-9"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-2">...</span>
                                        ) : (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => goToPage(page as number)}
                                                className="h-9 w-9 p-0"
                                            >
                                                {page}
                                            </Button>
                                        )
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && allVideos.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No videos found</p>
                </div>
            )}
        </div>
    );
}