
import { writeFile } from 'fs/promises';
import path from 'path';

export async function uploadLocally(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    // Ensure uploads directory exists
    await createUploadsDirectory();

    // Write file
    await writeFile(filePath, buffer);

    // Return the public URL path
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file locally');
  }
}

async function createUploadsDirectory() {
  const fs = require('fs/promises');
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  try {
    await fs.access(uploadDir);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(uploadDir, { recursive: true });
  }
}