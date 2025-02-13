
import { useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Upload } from "lucide-react";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Array<{ type: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles) => {
      toast({
        title: "Files uploaded",
        description: `${acceptedFiles.length} files have been uploaded successfully.`,
      });
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { type: "user", content: input }]);
    // Simulated AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: "assistant", 
        content: "I understand your question. Based on your notes, here's what I found..." 
      }]);
    }, 1000);
    
    setInput("");
  };

  return (
    <div className="h-screen flex">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r bg-secondary/50 p-4">
        <h2 className="font-semibold mb-4">Chat History</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="p-2 rounded hover:bg-secondary cursor-pointer transition-colors"
              >
                <MessageSquare className="inline-block mr-2 w-4 h-4" />
                <span className="text-sm truncate">
                  {msg.content.substring(0, 20)}...
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
