"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

function FilePreviewItem({
  file,
  index,
  selected,
  onToggle,
  onPreview,
}: {
  file: File;
  index: number;
  selected: boolean;
  onToggle: (index: number) => void;
  onPreview: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
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
    <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(index)}
        className="mt-1 h-5 w-5 rounded border-border"
      />

      {/* File Preview */}
      {isImage && previewUrl && (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
          <img
            src={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {isPDF && previewUrl && (
        <div className="h-64 w-48 shrink-0 overflow-hidden rounded-md border border-border bg-background relative group">
          <object
            data={previewUrl}
            type="application/pdf"
            className="h-full w-full pointer-events-none"
          >
            <div className="flex h-full items-center justify-center bg-muted text-xs text-center p-2">
              PDF Preview Unavailable
            </div>
          </object>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-background/80 px-2 py-1 rounded text-xs font-medium">
              Click to select
            </div>
          </div>
        </div>
      )}

      {!isImage && !isPDF && (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-2xl">
          📄
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate text-base">
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase">
          {file.name.split(".").pop()}
        </p>
      </div>

      {isImage && previewUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onPreview(previewUrl);
          }}
          className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors self-center mr-2"
          title="View Full Preview"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}
    </label>
  );
}

interface FileConverterProps {
  uploadedFiles: File[];
  onConvert: (
    fileIndices: number[],
    conversionType: string,
    options?: Record<string, any>
  ) => void;
  isProcessing: boolean;
}

type ConversionCategory = "documents" | "images" | "merging";

interface Conversion {
  type: string;
  label: string;
  category: ConversionCategory;
  note?: string;
}

const conversions: Conversion[] = [
  // Document conversions
  {
    type: "pdf",
    label: "Convert to PDF",
    category: "documents",
    note: "From documents to PDF format",
  },
  {
    type: "docx",
    label: "Convert to Word",
    category: "documents",
    note: "Requires external service setup",
  },
  {
    type: "xlsx",
    label: "Convert to Excel",
    category: "documents",
    note: "Requires external service setup",
  },
  {
    type: "pptx",
    label: "Convert to PowerPoint",
    category: "documents",
    note: "Requires external service setup",
  },
  {
    type: "txt",
    label: "Convert to Text",
    category: "documents",
    note: "Requires external service setup",
  },

  // Image conversions
  {
    type: "pdf",
    label: "Convert to PDF",
    category: "images",
    note: "Convert image to PDF",
  },
  {
    type: "png",
    label: "Convert to PNG",
    category: "images",
    note: "Lossless PNG format",
  },
  {
    type: "jpg",
    label: "Convert to JPG",
    category: "images",
    note: "Compressed JPEG format",
  },
  {
    type: "webp",
    label: "Convert to WebP",
    category: "images",
    note: "Modern image format",
  },
  {
    type: "svg",
    label: "Convert to SVG",
    category: "images",
    note: "Vector format (experimental)",
  },

  // Merging options
  {
    type: "merge-pdf",
    label: "Merge as PDF",
    category: "merging",
    note: "Combine PDFs into one",
  },
  {
    type: "merge-images-vertical",
    label: "Merge Images Vertically",
    category: "merging",
    note: "Stack images from top to bottom",
  },
  {
    type: "merge-images-horizontal",
    label: "Merge Images Horizontally",
    category: "merging",
    note: "Stack images from left to right",
  },
];

export function FileConverter({
  uploadedFiles,
  onConvert,
  isProcessing,
}: FileConverterProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] =
    useState<ConversionCategory>("documents");
  const [qualitySlider, setQualitySlider] = useState(80);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const categories: ConversionCategory[] = ["documents", "images", "merging"];
  const filteredConversions = conversions.filter(
    (c) => c.category === selectedCategory
  );

  const toggleFileSelection = (index: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === uploadedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(uploadedFiles.map((_, i) => i)));
    }
  };

  const handleConvert = (conversion: Conversion) => {
    if (selectedFiles.size === 0) {
      alert("Please select at least one file");
      return;
    }

    const options = {
      quality: qualitySlider,
    };

    onConvert(Array.from(selectedFiles), conversion.type, options);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Conversion Options
        </h2>

        {/* Category tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedCategory === category
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category === "documents" && "📄 Documents"}
              {category === "images" && "🖼️ Images"}
              {category === "merging" && "🔗 Merge"}
            </button>
          ))}
        </div>

        {/* Quality slider for images */}
        {selectedCategory === "images" && (
          <div className="mb-6 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Quality: {qualitySlider}%
            </label>
            <input
              type="range"
              min="30"
              max="100"
              value={qualitySlider}
              onChange={(e) => setQualitySlider(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values = smaller file size, lower quality
            </p>
          </div>
        )}

        {/* Conversion options */}
        <div className="space-y-2">
          {filteredConversions.map((conversion) => (
            <button
              key={conversion.type}
              onClick={() => handleConvert(conversion)}
              disabled={isProcessing || selectedFiles.size === 0}
              className="w-full rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              title={conversion.note}
            >
              <div className="font-medium text-foreground">
                {conversion.label}
              </div>
              {conversion.note && (
                <div className="text-xs text-muted-foreground">
                  {conversion.note}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* File selection */}
      {uploadedFiles.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Select Files ({selectedFiles.size})
            </h3>
            <button
              onClick={selectAllFiles}
              className="text-sm text-primary hover:underline"
            >
              {selectedFiles.size === uploadedFiles.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="space-y-2 max-h-[800px] overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <FilePreviewItem
                key={index}
                file={file}
                index={index}
                selected={selectedFiles.has(index)}
                onToggle={toggleFileSelection}
                onPreview={setPreviewImage}
              />
            ))}
          </div>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
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
