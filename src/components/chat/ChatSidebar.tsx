
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat } from "@/types/chat";
import { LogOut, Plus, Trash2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  onDeleteChat: (id: string) => void;
}

export const ChatSidebar = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onSignOut,
  onDeleteChat,
}: ChatSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-[280px] h-full flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <Button onClick={onNewChat} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-purple-100 dark:hover:bg-purple-800 ${
                chat.id === currentChatId ? 'bg-purple-200 dark:bg-purple-700' : ''
              }`}
            >
              <button
                onClick={() => onChatSelect(chat.id)}
                className="flex-1 text-left truncate"
              >
                {chat.title}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteChat(chat.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button 
          onClick={onSignOut} 
          variant="outline" 
          className="w-full text-red-600 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
};
