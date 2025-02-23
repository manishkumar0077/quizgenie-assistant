
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => Promise<void>;
  isProcessing: boolean;
  acceptedFileTypes?: Record<string, string[]>;
}

export const FileUploadArea = ({ 
  onDrop, 
  isProcessing, 
  acceptedFileTypes = { 
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
  }
}: FileUploadAreaProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    maxFiles: 1,
    multiple: false,
    maxSize: 10485760, // 10MB
    onDrop,
    disabled: isProcessing
  });

  return (
    <motion.div
      {...getRootProps({
        onClick: (e) => {
          if (isProcessing) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      })}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer bg-white/30 backdrop-blur-sm ${
        isDragActive ? 'border-primary bg-primary/10' : 'hover:bg-white/40'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2 text-purple-600" />
      <p className="text-sm text-purple-800 font-medium">
        {isProcessing 
          ? "Processing file... Please wait."
          : "Drop your PDF or image file here, or click to select (up to 10MB)"}
      </p>
    </motion.div>
  );
};
