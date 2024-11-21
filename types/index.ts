export interface Model {
    id: string
    name: string
    description: string
  }
  
  export interface UploadedImage {
    file: File
    preview: string
    id: string
  }
  
  export interface RecognizedBook {
    id: string
    imageUrl: string
    title: string
    author: string
    isConfirmed: boolean
  }
  
  export interface ProcessImageResponse {
    results: {
      title: string
      author: string
    }[]
  }