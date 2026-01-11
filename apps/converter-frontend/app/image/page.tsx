"use client";

import * as React from "react";
import { FileUpload } from "@converter/frontend-lib";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Download,
  Minimize,
  MoveHorizontal,
  MoveVertical,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function ImagePage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("merge");
  const [mergeDirection, setMergeDirection] = React.useState<
    "vertical" | "horizontal"
  >("vertical");
  const [convertFormat, setConvertFormat] = React.useState("png");

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const options = {
        quality: 80,
      };

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("conversionType", `merge-images-${mergeDirection}`);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to merge");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error merging images");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    const options = {
      quality: 80,
    };

    const formData = new FormData();
    formData.append("files", files[0]); // Only take first file for now
    formData.append("conversionType", convertFormat);
    formData.append("options", JSON.stringify(options));

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to convert");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error(error);
      alert("Error converting image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Image Tools</h1>
        <p className="text-muted-foreground text-lg">
          Process, convert, and combine your images seamlessly.
        </p>
      </div>

      <Tabs
        defaultValue="merge"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-center mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 backdrop-blur-sm rounded-full">
            <TabsTrigger value="merge" className="rounded-full">
              Merge Images
            </TabsTrigger>
            <TabsTrigger value="convert" className="rounded-full">
              Convert Images
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="merge"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Merge Images</CardTitle>
              <CardDescription>
                Stitch multiple images together vertically or horizontally.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8 flex items-center gap-4 justify-center">
                <Label className="text-base font-medium">
                  Merge Direction:
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      mergeDirection === "vertical" ? "default" : "outline"
                    }
                    onClick={() => setMergeDirection("vertical")}
                    className="rounded-full"
                  >
                    <MoveVertical className="mr-2 h-4 w-4" /> Vertical
                  </Button>
                  <Button
                    variant={
                      mergeDirection === "horizontal" ? "default" : "outline"
                    }
                    onClick={() => setMergeDirection("horizontal")}
                    className="rounded-full"
                  >
                    <MoveHorizontal className="mr-2 h-4 w-4" /> Horizontal
                  </Button>
                </div>
              </div>

              <FileUpload
                accept="image/*"
                multiple
                onFilesSelected={setFiles}
                className="mb-8"
              />

              <div className="flex justify-end">
                {resultUrl ? (
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-green-600 hover:bg-green-700"
                  >
                    <a href={resultUrl} download="merged.png">
                      <Download className="mr-2 h-4 w-4" />
                      Download Merged Image
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleMerge}
                    disabled={files.length < 2 || isProcessing}
                    className="rounded-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? "Merging..." : "Merge Images"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="convert"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Convert Images</CardTitle>
              <CardDescription>
                Convert images to different formats (PNG, JPG, WEBP, etc).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8 flex items-center gap-4 justify-center">
                <Label className="text-base font-medium">Target Format:</Label>
                <Select value={convertFormat} onValueChange={setConvertFormat}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FileUpload
                accept="image/*"
                multiple={false}
                onFilesSelected={setFiles}
                className="mb-8"
              />

              <div className="flex justify-end">
                {resultUrl ? (
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-green-600 hover:bg-green-700"
                  >
                    <a href={resultUrl} download={`converted.${convertFormat}`}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleConvert}
                    disabled={files.length === 0 || isProcessing}
                    className="rounded-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? "Converting..." : "Convert Image"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
