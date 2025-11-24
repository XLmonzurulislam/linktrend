
import { Link } from "wouter";
import { Play, Lock, Clock, Eye } from "lucide-react";
import { Video } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { user, unlockedVideos } = useStore();
  
  // A video is unlocked if:
  // 1. It's not premium (free video)
  // 2. User has unlocked it (in user.unlockedVideos)
  // 3. It's in the store's unlockedVideos
  const unlocked = !video.isPremium || 
                   (user && user.unlockedVideos?.includes(video.id)) || 
                   unlockedVideos.includes(video.id);

  return (
    <Link href={`/watch/${video.id}`} className="group relative block space-y-3 rounded-lg transition-all hover:opacity-95">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-sm">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg scale-90 transition-transform group-hover:scale-100">
            {unlocked ? (
              <Play className="ml-1 h-6 w-6 fill-current" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
        </div>

        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {video.duration}
        </div>

        {video.isPremium && !unlocked && (
          <div className="absolute top-2 right-2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-sm">
            PREMIUM
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-display font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          {video.isPremium && !unlocked && (
            <span className="shrink-0 font-bold text-primary text-sm">
              ৳{video.price}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {video.views} views
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {video.uploadDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
