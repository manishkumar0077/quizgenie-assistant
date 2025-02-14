
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => Promise<void>;
}

export const FileUploadArea = ({ onDrop }: FileUploadAreaProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 10485760, // 10MB
    onDrop
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-4 text-center mb-4 hover:bg-secondary/50 transition-colors cursor-pointer"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">
        Drop a file here, or click to select (PDF, Images, or Text files up to 10MB)
      </p>
    </div>
  );
};
