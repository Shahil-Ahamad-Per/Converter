"use client";

import * as React from "react";
import { UploadCloud, X, File as FileIcon, Eye } from "lucide-react";
import { cn } from "../lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string; // e.g., "image/*, application/pdf"
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

function FilePreviewItem({
  file,
  index,
  onRemove,
  onPreview,
}: {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  onPreview: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let url: string | null = null;
    const fileType = file.type;
    if (fileType.startsWith("image/") || fileType === "application/pdf") {
      try {
        url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } catch (e) {
        console.error("Failed to create object URL", e);
      }
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  return (
    <div className="flex items-start justify-between p-3 bg-secondary/50 rounded-lg border border-border">
      <div className="flex items-start gap-4 overflow-hidden w-full">
        {/* Preview Area */}
        {isImage && previewUrl ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
            <img
              src={previewUrl}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : isPDF && previewUrl ? (
          <div className="h-48 w-36 shrink-0 overflow-hidden rounded-md border border-border bg-background relative group">
            <object
              data={previewUrl}
              type="application/pdf"
              className="h-full w-full pointer-events-none"
            >
              <div className="flex h-full items-center justify-center bg-muted text-xs text-center p-2">
                PDF Preview
              </div>
            </object>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-background/80 px-2 py-1 rounded text-xs font-medium">
                PDF
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-background rounded-md h-10 w-10 flex items-center justify-center shrink-0">
            <FileIcon className="w-5 h-5 text-primary" />
          </div>
        )}

        <div className="truncate flex-1 min-w-0 pt-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {isImage && previewUrl && (
          <button
            onClick={() => onPreview(previewUrl)}
            className="p-1 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
            title="View Full Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onRemove(index)}
          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
          title="Remove File"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function FileUpload({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    if (maxSize && file.size > maxSize) {
      alert(`File ${file.name} is too large`);
      return false;
    }
    // Simple basic check, ideally use a robust MIME checker
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(validateFile);
      if (multiple) {
        setFiles((prev) => [...prev, ...newFiles]);
        onFilesSelected([...files, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
        onFilesSelected([newFiles[0]]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(validateFile);
      if (multiple) {
        setFiles((prev) => [...prev, ...newFiles]);
        onFilesSelected([...files, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
        onFilesSelected([newFiles[0]]);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn("w-full max-w-xl mx-auto", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer bg-muted/50 hover:bg-muted",
          dragActive ? "border-primary bg-primary/10" : "border-border"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
        />
        <div className="p-4 rounded-full bg-background mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          Click to upload or drag and drop
        </h3>
        <p className="text-sm text-muted-foreground">
          {accept ? accept.replace(/,/g, ", ") : "All files"} (Max{" "}
          {maxSize / 1024 / 1024}MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Selected Files
          </h4>
          {files.map((file, i) => (
            <FilePreviewItem
              key={i}
              file={file}
              index={i}
              onRemove={removeFile}
              onPreview={setPreviewImage}
            />
          ))}
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Full view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
