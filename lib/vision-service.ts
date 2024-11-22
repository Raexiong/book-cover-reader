import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import fs from "fs/promises";

// Response type for all model handlers
interface RecognitionResult {
  title: string;
  author: string;
  confidence: number;
}

// Base class for model handlers
abstract class ModelHandler {
  abstract recognize(imagePath: string): Promise<RecognitionResult>;
}

// OpenAI Handler
class OpenAIHandler extends ModelHandler {
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : "{}";
  }

  async recognize(imagePath: string): Promise<RecognitionResult> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'This is a book cover. Please identify the book title and author. Return ONLY a JSON response in the format: {"title": "Book Title", "author": "Author Name"}',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const content = response.choices[0].message.content || "{}";
      const cleanedContent = this.cleanJsonResponse(content);

      console.log("Raw response:", content); // For debugging
      console.log("Cleaned response:", cleanedContent); // For debugging

      const result = JSON.parse(cleanedContent);

      return {
        title: result.title || "Unknown Title",
        author: result.author || "Unknown Author",
        confidence: 0.9, // OpenAI doesn't provide confidence scores
      };
    } catch (error) {
      console.error("OpenAI processing error:", error);
      throw error;
    }
  }
}

// Claude Handler
class ClaudeHandler extends ModelHandler {
  private client: Anthropic;

  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : "{}";
  }

  async recognize(imagePath: string): Promise<RecognitionResult> {
    try {
      // Read the image and convert to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");

      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'This is a book cover. Please identify the book title and author. Return ONLY a JSON response in the format: {"title": "Book Title", "author": "Author Name"} without any markdown formatting.',
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      // Claude returns the response in the content array
      const content = response.content[0].text || "{}";

      // Clean the response before parsing
      const cleanedContent = this.cleanJsonResponse(content);

      console.log("Raw Claude response:", content); // For debugging
      console.log("Cleaned Claude response:", cleanedContent); // For debugging

      const result = JSON.parse(cleanedContent);
      return {
        title: result.title || "Unknown Title",
        author: result.author || "Unknown Author",
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Claude processing error:", error);
      throw error;
    }
  }
}

// Moondream Handler
class MoondreamHandler extends ModelHandler {
  async recognize(imagePath: string): Promise<RecognitionResult> {
    return {
      title: "Moondream - Unknown Title",
      author: "Moondream - Unknown Author",
      confidence: 0.9,
    };
  }
}

// Llama Handler
class LlamaHandler extends ModelHandler {
  async recognize(imagePath: string): Promise<RecognitionResult> {
    return {
      title: "Llama - Unknown Title",
      author: "Llama - Unknown Author",
      confidence: 0.9,
    };
  }
}

// Factory to get appropriate handler
export class VisionService {
  private static handlers: { [key: string]: ModelHandler } = {
    openai: new OpenAIHandler(),
    claude: new ClaudeHandler(),
    moondream: new MoondreamHandler(),
    llama: new LlamaHandler(),
  };

  static getHandler(model: string): ModelHandler {
    const handler = this.handlers[model];
    if (!handler) {
      throw new Error(`Unsupported model: ${model}`);
    }
    return handler;
  }
}
