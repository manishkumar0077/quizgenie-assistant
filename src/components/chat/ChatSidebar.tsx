
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, Plus } from "lucide-react";
import { Chat } from "@/types/chat";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
}

export const ChatSidebar = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onSignOut,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 border-r bg-secondary/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Chats</h2>
        <Button variant="ghost" size="icon" onClick={onSignOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      <Button 
        variant="outline" 
        className="w-full mb-4"
        onClick={onNewChat}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-2 rounded hover:bg-secondary cursor-pointer transition-colors ${
                currentChatId === chat.id ? 'bg-secondary' : ''
              }`}
              onClick={() => onChatSelect(chat.id)}
            >
              <MessageSquare className="inline-block mr-2 w-4 h-4" />
              <span className="text-sm truncate">
                {chat.title}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
