import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "@/components/ui/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[], extractedText?: string) => Promise<void>;
  isProcessing: boolean;
  acceptedFileTypes?: Record<string, string[]>;
}

export const FileUploadArea = ({ 
  onDrop, 
  isProcessing, 
  acceptedFileTypes = { 
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg']
  }
}: FileUploadAreaProps) => {
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let textContent = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ');
      }
      
      return textContent;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast({
        title: "Error",
        description: "Failed to extract text from PDF",
        variant: "destructive",
      });
      return '';
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    maxFiles: 1,
    multiple: false,
    maxSize: 10485760, // 10MB
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        onDrop(acceptedFiles, extractedText);
      } else {
        onDrop(acceptedFiles);
      }
    },
    disabled: isProcessing
  });

  return (
    <motion.div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer bg-white/30 backdrop-blur-sm ${
        isDragActive ? 'border-primary bg-primary/10' : 'hover:bg-white/40'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      initial={false}
      animate={{
        scale: isDragActive ? 1.02 : 1
      }}
      whileTap={{ scale: 0.99 }}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2 text-purple-600" />
      <p className="text-sm text-purple-800 font-medium">
        {isProcessing 
          ? "Processing file... Please wait."
          : "Drop your PDF or image here, or click to select (up to 10MB)"}
      </p>
    </motion.div>
  );
};
