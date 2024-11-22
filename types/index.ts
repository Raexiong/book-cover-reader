export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  modelUsed: string;
  createdAt: string;
  isConfirmed: boolean;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

export interface RecognizedBook {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  confidence?: number;
  isConfirmed: boolean;
  modelUsed: string;
}
