"use client"

import type React from "react"

import { useState, useRef } from "react"

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploadZone({ onFilesSelected }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      } cursor-pointer p-12`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.svg,.gif,.bmp,.tiff"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-5xl">📁</div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Drop your files here or click to browse</h3>
          <p className="mt-1 text-sm text-muted-foreground">PDF, Documents, Images - up to 50MB each</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Select Files
        </button>
      </div>
    </div>
  )
}
