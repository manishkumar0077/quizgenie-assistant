
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface YouTubeSuggestionsProps {
  suggestions: Array<{
    title: string;
    video_id: string;
    thumbnail_url: string;
    description: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubeSuggestions = ({ suggestions, isOpen, onClose }: YouTubeSuggestionsProps) => {
  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Related Educational Videos</DialogTitle>
          <DialogDescription>
            Click on a video to watch it on YouTube
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions.map((video) => (
            <button
              key={video.video_id}
              onClick={() => openVideo(video.video_id)}
              className="text-left block p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="space-y-2">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full rounded-lg"
                />
                <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-500">
                  <ExternalLink className="w-3 h-3" />
                  Watch on YouTube
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
