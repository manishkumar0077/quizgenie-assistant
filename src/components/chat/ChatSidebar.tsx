
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  MessageSquare, 
  Plus, 
  Settings, 
  Trash2 
} from "lucide-react";
import { Chat } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserSettings } from "../settings/UserSettings";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  onDeleteChat?: (chatId: string) => void;
}

export const ChatSidebar = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onSignOut,
  onDeleteChat,
}: ChatSidebarProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no profile exists, create one
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <div className="w-64 border-r bg-secondary/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm truncate">
            {profile?.full_name || "User"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <UserSettings />
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
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
              className={`p-2 rounded hover:bg-secondary cursor-pointer transition-colors flex justify-between items-center ${
                currentChatId === chat.id ? 'bg-secondary' : ''
              }`}
            >
              <div 
                className="flex items-center flex-1 min-w-0"
                onClick={() => onChatSelect(chat.id)}
              >
                <MessageSquare className="shrink-0 w-4 h-4 mr-2" />
                <span className="text-sm truncate">
                  {chat.title}
                </span>
              </div>
              {onDeleteChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
