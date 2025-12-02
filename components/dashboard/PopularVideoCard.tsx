'use client';

import Image from 'next/image';
import { formatNumber } from '@/app/lib/formaters';
import { MessageSquare, ThumbsUp, BarChart2, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useChannel } from "@/app/context/ChannelContext";

interface PopularVideoCardProps {
  video: any;
}

export default function PopularVideoCard({ video }: PopularVideoCardProps) {
  const { timeRange } = useChannel();

  if (!video) return null;

  const snippet = video.snippet;
  const statistics = video.statistics;
  const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId || video.id}`;

  return (
    <Card className="col-span-12 md:col-span-4">
      <CardHeader>
        <CardTitle>Popular Video</CardTitle>
        <CardDescription>Last {timeRange}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          {/* Left: Video Info + Stats */}
          <div>
            {/* Thumbnail */}
            <a
              href={videoUrl}
              target="_blank"
              className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 block mb-3"
            >
              <Image
                src={snippet.thumbnails.high.url}
                alt={snippet.title}
                fill
                className="object-cover"
              />
            </a>

            {/* Title & Date */}
            <div className="mb-2">
              <a href={videoUrl} target="_blank">
                <h3 className="font-semibold text-sm text-gray-900 hover:underline line-clamp-2 mb-1">
                  {snippet.title}
                </h3>
              </a>
              <p className="text-xs text-gray-500">
                Published {new Date(snippet.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Stats with Icons - 4 Grid */}
            <div className="grid grid-cols-4 gap-2 my-3">
              {/* Views */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(statistics?.viewCount)}
                </div>
              </div>

              {/* Likes */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                  <div className="text-xs text-gray-500">Likes</div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(statistics?.likeCount)}
                </div>
              </div>

              {/* Comments */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div className="text-xs text-gray-500">Comments</div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(statistics?.commentCount)}
                </div>
              </div>

              {/* Audience Retention */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  <div className="text-xs text-gray-500">Retention</div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {video.privateStats ?
                    `${(video.privateStats.clickRatio * 100).toFixed(1)}%` :
                    '0%'
                  }
                </div>
              </div>
            </div>

            {/* View Video Analytics Button */}
            <Button className="w-full cursor-pointer" variant="default">
              <BarChart2 size={16} className="mr-2" />
              View Video Analytics
            </Button>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 mt-6">Latest Comments</h3>

              <div className="space-y-4">
                {video.comments?.slice(0, 3).map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.imageUrl}
                      alt={comment.name}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{comment.name}</h4>
                        <p className="text-xs text-gray-500 flex-shrink-0">{comment.date}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{comment.content}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {/* <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-gray-700">
                          <ThumbsUp size={12} className="mr-1" />
                          {comment.likeCount || 0}
                        </Button> */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-auto p-0 hover:text-gray-700"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id.videoId || video.id}&lc=${comment.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Reply
                          </a>
                        </Button> */}
                      </div>
                    </div>
                  </div>
                )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
              </div>
            </div>
          </div>

          {/* Right: Latest Comments */}
 
        </div>
      </CardContent>
    </Card>
  );
}
