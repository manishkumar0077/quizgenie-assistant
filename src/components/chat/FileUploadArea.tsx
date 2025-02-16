
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => Promise<void>;
  isProcessing: boolean;
}

export const FileUploadArea = ({ onDrop, isProcessing }: FileUploadAreaProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 10485760, // 10MB
    onDrop,
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center mb-4 transition-colors cursor-pointer ${
        isDragActive ? 'border-primary bg-primary/10' : 'hover:bg-secondary/50'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">
        {isProcessing 
          ? "Processing image... Please wait."
          : "Drop an image here, or click to select (Images up to 10MB)"}
      </p>
    </div>
  );
};
