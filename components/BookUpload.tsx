"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import type { Model, UploadedImage, RecognizedBook } from "@/types";
import EditBookDialog from "./EditBookDialog";

const models: Model[] = [
  {
    id: "llama",
    name: "Llama3.2-vision",
    description: "Meta's vision-language model",
  },

  { id: "claude", name: "Claude API", description: "Anthropic's vision model" },
  { id: "openai", name: "OpenAI API", description: "GPT-4 Vision model" },
];

export default function BookUpload() {
  const [selectedModel, setSelectedModel] = useState<string>("llama");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [recognizedBooks, setRecognizedBooks] = useState<RecognizedBook[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: UploadedImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
      }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const processImages = async () => {
    setIsProcessing(true);
    try {
      // First upload all images
      for (const image of uploadedImages) {
        const formData = new FormData();
        formData.append("file", image.file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload image");

        const { filePath } = await uploadResponse.json();
        // Process image with selected model
        const processResponse = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagePath: filePath,
            model: selectedModel,
          }),
        });
        if (!processResponse.ok) throw new Error("Failed to process image");

        const result = await processResponse.json();

        setRecognizedBooks((prev) => [
          ...prev,
          {
            id: image.id,
            imageUrl: filePath,
            title: result.title,
            author: result.author,
            confidence: result.confidence,
            isConfirmed: false,
            modelUsed: selectedModel,
          },
        ]);
      }
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleBookEdit = (id: string, title: string, author: string) => {
    setRecognizedBooks((prev) =>
      prev.map((book) => (book.id === id ? { ...book, title, author } : book))
    );
  };

  const confirmAndSaveBook = async (id: string) => {
    const book = recognizedBooks.find((book) => book.id === id);
    if (!book) return;

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          coverImage: book.imageUrl,
          modelUsed: book.modelUsed,
        }),
      });

      if (!response.ok) throw new Error("Failed to save book");

      setRecognizedBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isConfirmed: true } : b))
      );
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Select AI Model</h2>
        <RadioGroup
          value={selectedModel}
          onValueChange={setSelectedModel}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {models.map((model) => (
            <div
              key={model.id}
              className="flex items-start space-x-3 p-4 border rounded-lg"
            >
              <RadioGroupItem value={model.id} id={model.id} />
              <Label htmlFor={model.id} className="font-medium">
                <div>{model.name}</div>
                <div className="text-sm text-slate-500">
                  {model.description}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300"
            }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            Drag and drop your book cover images here, or click to select files
          </p>
        </div>
      </Card>

      {uploadedImages.length > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploadedImages.map((image) => {
              const recognizedBook = recognizedBooks.find(
                (book) => book.id === image.id
              );

              return (
                <div key={image.id} className="flex space-x-4">
                  <div className="relative w-32 h-48">
                    <Image
                      src={image.preview}
                      alt="Book cover"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {recognizedBook ? (
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label>Title</Label>
                        <div className="font-medium">
                          {recognizedBook.title}
                        </div>
                      </div>
                      <div>
                        <Label>Author</Label>
                        <div className="font-medium">
                          {recognizedBook.author}
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => confirmAndSaveBook(image.id)}
                          disabled={recognizedBook.isConfirmed}
                        >
                          {recognizedBook.isConfirmed
                            ? "Added to Library"
                            : "Add to Library"}
                        </Button>
                        <EditBookDialog
                          id={image.id}
                          currentTitle={recognizedBook.title}
                          currentAuthor={recognizedBook.author}
                          onSave={handleBookEdit}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-slate-500">Ready for processing</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <Button
              onClick={processImages}
              disabled={isProcessing || uploadedImages.length === 0}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Process Images"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
