
import { ExternalLink } from "lucide-react";

interface YouTubeSuggestionsProps {
  suggestions: Array<{
    title: string;
    video_id: string;
    thumbnail_url: string;
    description: string;
  }>;
}

export const YouTubeSuggestions = ({ suggestions }: YouTubeSuggestionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Related Videos</h3>
      <div className="space-y-4">
        {suggestions.map((video) => (
          <a
            key={video.video_id}
            href={`https://www.youtube.com/watch?v=${video.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg hover:bg-white/10 transition-colors"
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
          </a>
        ))}
      </div>
    </div>
  );
};
