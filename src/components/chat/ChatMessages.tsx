
import { Message } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const renderContent = (content: Message['content']) => {
    if (typeof content === 'string') {
      // Check if the content contains code blocks
      if (content.includes('```')) {
        const parts = content.split(/(```[^`]*```)/g);
        return parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            // Remove the backticks and language identifier if present
            const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
            return (
              <pre key={index} className="bg-zinc-900 text-zinc-100 p-4 rounded-lg my-2 overflow-x-auto">
                <code>{code}</code>
              </pre>
            );
          }
          // Format regular text with line breaks
          return <p key={index} className="whitespace-pre-wrap">{part}</p>;
        });
      }
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    
    // Handle structured response with answer and suggestions
    return (
      <div>
        <p className="whitespace-pre-wrap">{content.answer}</p>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 p-4 h-[calc(100vh-300px)]">
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-lg max-w-[80%]",
              msg.type === "user" 
                ? "ml-auto bg-primary text-white" 
                : "bg-secondary"
            )}
          >
            {renderContent(msg.content)}
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};
