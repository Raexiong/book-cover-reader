import { NextRequest, NextResponse } from "next/server";
import { getBooks, addBook } from "@/lib/storage";

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
