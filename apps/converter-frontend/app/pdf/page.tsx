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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function PdfPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("merge");

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/pdf/merge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to merge");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error(error);
      alert("Error merging PDFs");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    const formData = new FormData();
    formData.append("file", files[0]); // Only take first file for convert demo

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/pdf/convert`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to convert");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error(error);
      alert("Error converting file");
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
        <h1 className="text-4xl font-bold tracking-tight">PDF Tools</h1>
        <p className="text-muted-foreground text-lg">
          Merge, convert, and organize your PDF documents.
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
              Merge PDFs
            </TabsTrigger>
            <TabsTrigger value="convert" className="rounded-full">
              Convert to PDF
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="merge"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Merge PDFs</CardTitle>
              <CardDescription>
                Combine multiple PDF files into one document.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <FileUpload
                accept="application/pdf"
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
                    <a href={resultUrl} download="merged.pdf">
                      <Download className="mr-2 h-4 w-4" />
                      Download Merged PDF
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
                    {isProcessing ? "Merging..." : "Merge Files"}
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
              <CardTitle>Convert to PDF</CardTitle>
              <CardDescription>
                Convert documents images or text files to PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <FileUpload
                accept="image/*, text/plain"
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
                    <a href={resultUrl} download="converted.pdf">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
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
                    {isProcessing ? "Converting..." : "Convert to PDF"}
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
