
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUploadArea } from "../chat/FileUploadArea";
import { motion } from "framer-motion";
import { Loader2, Timer, FileText } from "lucide-react";

interface QuizCreatorProps {
  onClose: () => void;
  onQuizCreated: (text: string) => void;
}

export const QuizCreator = ({ onClose, onQuizCreated }: QuizCreatorProps) => {
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [timeLimit, setTimeLimit] = useState<string>("10");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', 'K85459790888957');
      formData.append('OCREngine', '2');
      formData.append('language', 'eng');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new Error('No text found in the document');
      }

      const extractedText = data.ParsedResults[0].ParsedText;
      onQuizCreated(extractedText);
      onClose();

      toast({
        title: "Document processed successfully",
        description: "Your quiz content has been extracted.",
      });
    } catch (error: any) {
      toast({
        title: "Error processing document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-purple-200 space-y-6 max-w-xl mx-auto"
    >
      <div className="text-2xl font-bold text-purple-800 mb-4">Create Quiz</div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Difficulty Level
          </label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Time Limit (minutes)
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              min="1"
              max="60"
            />
            <Timer className="text-purple-600" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Upload Document
          </label>
          <div className="border-2 border-dashed border-purple-200 rounded-lg p-4">
            <FileUploadArea
              onDrop={handleFileUpload}
              isProcessing={isProcessing}
              acceptedFileTypes={{
                'application/pdf': ['.pdf'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'text/plain': ['.txt'],
                'image/*': ['.png', '.jpg', '.jpeg']
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Create Quiz
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
