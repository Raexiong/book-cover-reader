// app/api/process-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadLocally } from "@/lib/upload-utils";
import { recognizeBookCover } from "@/lib/vision-service";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  console.log("POST", request);

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const model = formData.get("model") as string;

    const results = await Promise.all(
      files.map(async (file) => {
        // 1. Save image locally
        const imagePath = await uploadLocally(file);

        // 2. Process with selected AI model
        const recognition = await recognizeBookCover(imagePath, model);

        // 3. Create initial book record
        const book = await prisma.book.create({
          data: {
            title: recognition.title,
            author: recognition.author,
            coverImage: imagePath,
            modelUsed: model,
            confidence: recognition.confidence,
          },
        });

        return {
          id: book.id,
          title: recognition.title,
          author: recognition.author,
          confidence: recognition.confidence,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    );
  }
}
