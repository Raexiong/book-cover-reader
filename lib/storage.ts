import { writeFile, readFile } from "fs/promises";
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
