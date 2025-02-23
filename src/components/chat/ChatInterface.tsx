import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analyzeDocument, generateQuiz, performOCR } from "@/utils/gemini";
import { Chat, Message } from "@/types/chat";
import { ChatSidebar } from "./ChatSidebar";
import { FileUploadArea } from "./FileUploadArea";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { QuizCreator } from "../quiz/QuizCreator";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setMessages([{ type: "assistant", content: "Hi! Welcome to Studify. I'm your AI study assistant. You can upload study materials like images or text files, and I'll help you understand them better. Just drag and drop a file to get started!" }]);
      }
    };
    getCurrentUser();
  }, []);

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

  const handleFileUpload = async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(`${userId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study_materials')
        .getPublicUrl(`${userId}/${fileName}`);

      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          resolve(base64.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(file);
      });

      const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: new FormData(),
      });

      const ocrData = await ocrResponse.json();

      if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
        throw new Error('No text found in the image');
      }

      const extractedText = ocrData.ParsedResults[0].ParsedText;

      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_type: file.type,
          content: extractedText,
          file_url: publicUrl,
          document_type: 'image',
          user_id: userId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setMessages(prev => [
        ...prev,
        { 
          type: "assistant", 
          content: `I've analyzed your image and here's what I found:\n\n${extractedText}`
        }
      ]);

      await supabase.from('chat_history').insert({
        message: extractedText,
        role: 'assistant',
        user_id: userId,
        chat_id: currentChatId
      });

      toast({
        title: "Image processed successfully",
        description: "The text has been extracted and added to the chat.",
      });
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
      setMessages(prev => [
        ...prev,
        { 
          type: "assistant", 
          content: "I apologize, but I encountered an error processing your image. Please try again with a clearer image."
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !userId || !currentChatId) return;
    
    try {
      const userMessage = input;
      setMessages(prev => [...prev, { type: "user", content: userMessage }]);
      setInput(""); // Clear input immediately for better UX
      setIsProcessing(true);

      await supabase.from('chat_history').insert({
        message: userMessage,
        role: 'user',
        user_id: userId,
        chat_id: currentChatId
      });

      const aiResponse = await analyzeDocument(
        `You are a helpful and friendly study assistant. Respond in a conversational way to this message: ${userMessage}\n\n` +
        `Previous conversation context: ${messages.slice(-3).map(m => `${m.type}: ${m.content}`).join('\n')}`
      );

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
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: "I apologize, but I encountered an error processing your request. Please try again." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('chat_history')
        .delete()
        .eq('chat_id', chatId);

      await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      setChats(chats.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
          setMessages([]);
        } else {
          setCurrentChatId(null);
          setMessages([{ 
            type: "assistant", 
            content: "Hi! Welcome to Studify. I'm your AI study assistant. You can upload study materials like images or text files, and I'll help you understand them better. Just drag and drop a file to get started!" 
          }]);
        }
      }

      toast({
        title: "Chat deleted",
        description: "The chat history has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting chat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuizCreated = (extractedText: string) => {
    setMessages(prev => [
      ...prev,
      { type: "assistant", content: `Here's the extracted text from your document:\n\n${extractedText}` }
    ]);
  };

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
    <div className="h-screen flex bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300">
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className={`${isMobile ? 'absolute z-50' : 'relative'} h-full glass-panel`}
          >
            <ChatSidebar
              chats={chats}
              currentChatId={currentChatId}
              onChatSelect={setCurrentChatId}
              onNewChat={createNewChat}
              onSignOut={handleSignOut}
              onDeleteChat={handleDeleteChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        {isMobile && (
          <div className="p-4 border-b glass-panel">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-hidden glass-panel m-4 rounded-xl">
            <ChatMessages messages={messages} />
          </div>
          
          <div className="p-4 space-y-4">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : "Ask a question about your study materials..."}
            />
            
            <div className="flex gap-4">
              <Button
                onClick={() => setShowQuizCreator(true)}
                className="w-full glass-panel hover:bg-purple-500 hover:text-white transition-colors"
                variant="outline"
              >
                Create a Quiz
              </Button>
            </div>

            <div className="glass-panel rounded-xl">
              <FileUploadArea 
                onDrop={handleFileUpload} 
                isProcessing={isProcessing} 
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showQuizCreator && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <QuizCreator
                onClose={() => setShowQuizCreator(false)}
                onQuizCreated={handleQuizCreated}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;
