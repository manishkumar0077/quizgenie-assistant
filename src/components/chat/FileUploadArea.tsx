
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => Promise<void>;
}

export const FileUploadArea = ({ onDrop }: FileUploadAreaProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false,
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
        Drag & drop files here, or click to select files
      </p>
    </div>
  );
};
