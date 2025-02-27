
import { Message } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
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
  );
};
