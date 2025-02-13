
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask a question about your study materials..."
        onKeyPress={(e) => e.key === "Enter" && onSend()}
        className="flex-1"
      />
      <Button onClick={onSend}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};
