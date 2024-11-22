// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size must be less than 5MB",
    };
  }

  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "File must be an image",
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, "");
  return `${timestamp}-${randomString}-${cleanName}`;
}
