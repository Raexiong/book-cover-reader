import { NextRequest, NextResponse } from "next/server";
import { getBooks, addBook, deleteBook } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.author || !body.coverImage || !body.modelUsed) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // Validate image path
    if (!body.coverImage.startsWith("/uploads/")) {
      return NextResponse.json(
        {
          error: "Invalid image path",
        },
        {
          status: 400,
        }
      );
    }

    const book = await addBook({
      title: body.title,
      author: body.author,
      coverImage: body.coverImage,
      modelUsed: body.modelUsed,
      isConfirmed: true,
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error saving book:", error);
    return NextResponse.json({ error: "Failed to save book" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const books = await getBooks();
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    await deleteBook(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
