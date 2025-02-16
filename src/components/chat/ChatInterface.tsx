import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { FileUploadArea } from "./FileUploadArea";
import UserSettings from "../settings/UserSettings";
import ChatSidebar from "./ChatSidebar";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Book, Brain, ChartLineUp, Stars } from "lucide-react";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleFileUpload = async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    try {
      if (!userId) {
        toast({
          title: "Authentication Error",
          description: "User ID not found. Please ensure you are logged in.",
          variant: "destructive",
        });
        return;
      }

      for (const file of acceptedFiles) {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('document-store')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("File upload error:", uploadError);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          continue;
        }

        const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/document-store/${fileName}`;

        setMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          content: `Uploaded ${file.name}. Analyzing...`,
          sender: "bot",
          timestamp: new Date().toISOString(),
        }]);

        const { data, error } = await supabase.functions.invoke('process-document', {
          body: {
            file_url: publicURL,
            file_name: file.name,
            user_id: userId,
          }
        });

        if (error) {
          console.error("Function invocation error:", error);
          toast({
            title: "Processing Failed",
            description: `Failed to process ${file.name}. Please try again.`,
            variant: "destructive",
          });
          setMessages(prevMessages => prevMessages.map(msg =>
            msg.content === `Uploaded ${file.name}. Analyzing...` ?
              { ...msg, content: `Failed to process ${file.name}. Please try again.`, } : msg
          ));
        } else {
          setMessages(prevMessages => prevMessages.map(msg =>
            msg.content === `Uploaded ${file.name}. Analyzing...` ?
              { ...msg, content: data.response } : msg
          ));
          toast({
            description: `Document ${file.name} processed successfully!`,
          });
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewMessage = async (content: string) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "User ID not found. Please ensure you are logged in.",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: content,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          user_id: userId,
        }
      });

      if (error) {
        console.error("Function invocation error:", error);
        toast({
          title: "Chat Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        setMessages(prevMessages => prevMessages.map(msg =>
          msg.id === newMessage.id ? { ...msg, content: "Failed to send message. Please try again." } : msg
        ));
      } else {
        const botResponse: Message = {
          id: Date.now().toString(),
          content: data.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <ChatSidebar currentChatId={currentChatId} onChatSelect={setCurrentChatId} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 col-span-full"
          >
            <FileUploadArea onDrop={handleFileUpload} isProcessing={isProcessing} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4"
          >
            <Book className="w-8 h-8 text-purple-300" />
            <div>
              <h3 className="text-white font-semibold">Study Materials</h3>
              <p className="text-gray-300 text-sm">Upload and analyze documents</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4"
          >
            <Brain className="w-8 h-8 text-blue-300" />
            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <p className="text-gray-300 text-sm">Get instant help and explanations</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4"
          >
            <ChartLineUp className="w-8 h-8 text-green-300" />
            <div>
              <h3 className="text-white font-semibold">Progress Tracking</h3>
              <p className="text-gray-300 text-sm">Monitor your learning journey</p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden bg-white/5 backdrop-blur-lg rounded-t-2xl mx-4">
          <ChatMessages messages={messages} />
        </div>
        
        <div className="p-4">
          <ChatInput onSendMessage={handleNewMessage} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="w-64 p-4 bg-white/5 backdrop-blur-lg"
      >
        <UserSettings />
      </motion.div>
    </div>
  );
};

export default ChatInterface;
