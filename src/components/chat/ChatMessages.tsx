
import { Message } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
}

// Helper function to format code blocks in messages
const formatMessage = (content: string) => {
  // Pattern to match code blocks with language specification: ```language\ncode\n```
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)\n```/g;
  
  if (!codeBlockRegex.test(content)) {
    // If no code blocks, preserve line breaks by replacing '\n' with <br/>
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== content.split('\n').length - 1 && <br />}
      </span>
    ));
  }

  // Reset regex lastIndex
  codeBlockRegex.lastIndex = 0;
  
  let lastIndex = 0;
  const parts = [];
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(
        <span key={key++}>
          {textBefore.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i !== textBefore.split('\n').length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    }

    // Add code block
    const language = match[1] || '';
    const code = match[2];
    parts.push(
      <div key={key++} className="my-2 overflow-x-auto w-full">
        <div className="bg-black/80 rounded-md p-3 font-mono text-sm text-white">
          {language && (
            <div className="text-xs text-gray-400 pb-1">{language}</div>
          )}
          <pre className="whitespace-pre-wrap break-all">{code}</pre>
        </div>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last code block
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    parts.push(
      <span key={key++}>
        {textAfter.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i !== textAfter.split('\n').length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  }

  return parts;
};

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 h-full">
      <div className="space-y-6 pb-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg max-w-[85%] shadow-sm ${
              msg.type === "user"
                ? "ml-auto bg-primary text-white"
                : "bg-secondary/80 text-foreground"
            }`}
          >
            <div className="prose prose-sm break-words">{formatMessage(msg.content)}</div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
