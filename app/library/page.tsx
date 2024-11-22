"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Book } from "@/types";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBooks, setDeletingBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Add book to deleting state
      setDeletingBooks((prev) => new Set(prev).add(id));

      const response = await fetch(`/api/books?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      // Remove book from state
      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      // Remove book from deleting state
      setDeletingBooks((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading books...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book Library</h1>

      {books.length === 0 ? (
        <div className="text-center text-slate-500 p-6">
          No books in the library yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
                    <p className="text-slate-600 mb-2">{book.author}</p>
                    <p className="text-sm text-slate-500">
                      Model: {book.modelUsed}
                    </p>
                    <p className="text-sm text-slate-500">
                      Added on {new Date(book.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingBooks.has(book.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
