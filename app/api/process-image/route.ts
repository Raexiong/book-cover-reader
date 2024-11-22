import { NextRequest, NextResponse } from "next/server";
import { VisionService } from "@/lib/vision-service";
import path from "path";

// Mock function to simulate AI processing
function mockRecognition(model: string) {
  // Simulate different responses based on model
  const responses = {
    llama: {
      title: "Llama - Sample Book Title",
      author: "John Smith",
      confidence: 0.85,
    },
    moondream: {
      title: "Moondream - Sample Book Title",
      author: "Jane Doe",
      confidence: 0.92,
    },
    claude: {
      title: "Claude - Sample Book Title",
      author: "Alice Johnson",
      confidence: 0.88,
    },
    openai: {
      title: "GPT - Sample Book Title",
      author: "Bob Wilson",
      confidence: 0.95,
    },
  };

  // Add some randomness to make it more realistic
  const randomSuffix = Math.floor(Math.random() * 1000);
  const result = responses[model as keyof typeof responses] || responses.llama;

  return {
    ...result,
    title: `${result.title} #${randomSuffix}`,
    confidence: result.confidence * (0.9 + Math.random() * 0.2),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, model } = body;

    if (!imagePath || !model) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // The following 4 lines are the working version using mock data
    // // Simulate processing delay
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    // // Get mock recognition results
    // const result = mockRecognition(model);

    // Get the full path to the image
    const fullImagePath = path.join(process.cwd(), "public", imagePath);
    // Get the appropriate handler and process the image
    const handler = VisionService.getHandler(model);
    const result = await handler.recognize(fullImagePath);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
