
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Upload, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  document_id: string | null;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Array<{ type: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load user's chats
  useEffect(() => {
    const loadChats = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading chats",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setChats(data);
        if (data.length > 0 && !currentChatId) {
          setCurrentChatId(data[0].id);
        }
      }
    };

    if (userId) {
      loadChats();
    }
  }, [userId, currentChatId]);

  const createNewChat = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: `New Chat ${new Date().toLocaleString()}`,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setChats([data, ...chats]);
        setCurrentChatId(data.id);
        setMessages([]);
      }
    } catch (error: any) {
      toast({
        title: "Error creating chat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: async (acceptedFiles) => {
      if (!userId) return;

      for (const file of acceptedFiles) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('study_materials')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { error: dbError } = await supabase
            .from('documents')
            .insert({
              filename: file.name,
              file_type: file.type,
              content: 'Processing...', // This will be updated after OCR/processing
              user_id: userId
            });

          if (dbError) throw dbError;

          toast({
            title: "File uploaded",
            description: `${file.name} has been uploaded successfully.`,
          });
        } catch (error: any) {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
  });

  const handleSend = async () => {
    if (!input.trim() || !userId || !currentChatId) return;
    
    try {
      await supabase.from('chat_history').insert({
        message: input,
        role: 'user',
        user_id: userId,
        chat_id: currentChatId
      });

      setMessages([...messages, { type: "user", content: input }]);
      setInput("");

      // Simulated AI response - this will be replaced with actual AI integration
      const aiResponse = "I understand your question. Based on your notes, here's what I found...";
      
      await supabase.from('chat_history').insert({
        message: aiResponse,
        role: 'assistant',
        user_id: userId,
        chat_id: currentChatId
      });

      setMessages(prev => [...prev, { type: "assistant", content: aiResponse }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Load chat history for current chat
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId || !currentChatId) return;

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error loading chat history",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setMessages(
          data.map(msg => ({
            type: msg.role,
            content: msg.message
          }))
        );
      }
    };

    if (userId && currentChatId) {
      loadChatHistory();
    }
  }, [userId, currentChatId]);

  return (
    <div className="h-screen flex">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r bg-secondary/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="w-full mb-4"
          onClick={createNewChat}
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
                onClick={() => setCurrentChatId(chat.id)}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg max-w-[80%] ${
                  msg.type === "user"
                    ? "ml-auto bg-primary text-white"
                    : "bg-secondary"
                }`}
              >
                {msg.content}
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* File Upload Area */}
        <div className="p-4 border-t">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-4 text-center mb-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select files
            </p>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your study materials..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
