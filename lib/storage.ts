import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import type { Book } from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "books.json");

// Initialize the database if it doesn't exist
async function initDB() {
  try {
    await readFile(DB_PATH, "utf-8");
  } catch (error) {
    // If file doesn't exist, create it with empty array
    await writeFile(DB_PATH, JSON.stringify([]), "utf-8");
  }
}

// Get all books
export async function getBooks(): Promise<Book[]> {
  await initDB();
  const data = await readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

// Add a new book
export async function addBook(
  book: Omit<Book, "id" | "createdAt">
): Promise<Book> {
  const books = await getBooks();

  const newBook: Book = {
    ...book,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
  };

  books.push(newBook);
  await writeFile(DB_PATH, JSON.stringify(books, null, 2), "utf-8");
  return newBook;
}

// Add new delete function
export async function deleteBook(id: string): Promise<void> {
  const books = await getBooks();

  // Find the book to get its image path
  const bookToDelete = books.find((book) => book.id === id);
  if (!bookToDelete) {
    throw new Error("Book not found");
  }

  // Remove the book from the array
  const updatedBooks = books.filter((book) => book.id !== id);

  // Update the JSON file
  await writeFile(DB_PATH, JSON.stringify(updatedBooks, null, 2), "utf-8");

  // Try to delete the image file
  try {
    const imagePath = path.join(
      process.cwd(),
      "public",
      bookToDelete.coverImage
    );
    await unlink(imagePath);
  } catch (error) {
    console.error("Failed to delete image file:", error);
    // Continue even if image deletion fails
  }
}
