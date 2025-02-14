
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analyzeDocument, generateQuiz, performOCR } from "@/utils/gemini";
import { Chat, Message } from "@/types/chat";
import { ChatSidebar } from "./ChatSidebar";
import { FileUploadArea } from "./FileUploadArea";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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
    if (!userId || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      let fileContent: string;
      
      if (file.type.startsWith('image/')) {
        // Handle image files with OCR
        const reader = new FileReader();
        fileContent = await new Promise((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const base64Data = e.target?.result as string;
              const ocrResult = await performOCR(base64Data);
              resolve(ocrResult);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        // Handle text-based files
        fileContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(`${userId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_type: file.type,
          content: fileContent,
          user_id: userId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "File uploaded",
        description: "Processing your document...",
      });

      const analysis = await analyzeDocument(fileContent);
      const quiz = await generateQuiz(fileContent);

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          analyzed_content: analysis,
          quiz_metadata: quiz
        })
        .eq('id', documentData.id);

      if (updateError) throw updateError;

      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          title: `Chat about ${file.name}`,
          user_id: userId,
          document_id: documentData.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      setChats(prev => [chatData, ...prev]);
      setCurrentChatId(chatData.id);
      setMessages([]);

      toast({
        title: "Document processed",
        description: "Your document has been analyzed and is ready for chat!",
      });
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

      const { data: chatData } = await supabase
        .from('chats')
        .select('document_id')
        .eq('id', currentChatId)
        .single();

      if (chatData?.document_id) {
        const { data: documentData } = await supabase
          .from('documents')
          .select('content, analyzed_content')
          .eq('id', chatData.document_id)
          .single();

        if (documentData) {
          const response = await analyzeDocument(
            `Context: ${documentData.analyzed_content}\n\nQuestion: ${input}\n\nProvide a helpful response based on the context.`
          );

          await supabase.from('chat_history').insert({
            message: response,
            role: 'assistant',
            user_id: userId,
            chat_id: currentChatId
          });

          setMessages(prev => [...prev, { type: "assistant", content: response }]);
        }
      }
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
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col">
        <ChatMessages messages={messages} />
        <div className="p-4 border-t">
          <FileUploadArea onDrop={handleFileUpload} />
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
