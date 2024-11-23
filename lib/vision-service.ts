import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import {
  AutoProcessor,
  AutoTokenizer,
  Moondream1ForConditionalGeneration,
  RawImage,
} from "@huggingface/transformers";
import { Ollama } from "ollama";

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
  constructor() {
    super();
  }

  async recognize(imagePath: string): Promise<RecognitionResult> {
    console.log("moondream", imagePath);

    try {
      // Load processor, tokenizer and model
      const model_id = "Xenova/moondream2";
      const processor = await AutoProcessor.from_pretrained(model_id);
      const tokenizer = await AutoTokenizer.from_pretrained(model_id);
      const model = await Moondream1ForConditionalGeneration.from_pretrained(
        model_id,
        {
          dtype: {
            embed_tokens: "fp16", // or 'fp32'
            vision_encoder: "fp16", // or 'q8'
            decoder_model_merged: "q4", // or 'q4f16' or 'q8'
          },
          device: "auto",
        }
      );

      // Prepare text inputs
      const prompt =
        'This is a book cover. Please identify the book title and author. Return ONLY a JSON response in the format: {"title": "Book Title", "author": "Author Name"} without any markdown formatting.';
      const text = `<image>\n\nQuestion: ${prompt}\n\nAnswer:`;
      const text_inputs = tokenizer(text);

      // Prepare vision inputs
      const image = await RawImage.read(imagePath);
      const vision_inputs = await processor(image);

      // Generate response
      const output = await model.generate({
        ...text_inputs,
        ...vision_inputs,
        do_sample: false,
        max_new_tokens: 64,
      });
      const decoded = tokenizer.batch_decode(output, {
        skip_special_tokens: false,
      });

      console.log("decoded", decoded);
    } catch (error) {
      console.error("Moondream processing error:", error);
      throw error;
    }
    return {
      title: "Moondream - Unknown Title",
      author: "Moondream - Unknown Author",
      confidence: 0.9,
    };
  }
}

// Llama Handler
class LlamaHandler extends ModelHandler {
  private client: Ollama;

  constructor() {
    super();
    this.client = new Ollama({ host: "http://127.0.0.1:11434" });
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

      const response = await this.client.chat({
        model: "llama3.2-vision",
        messages: [
          {
            role: "user",
            content:
              'This is a book cover. Please identify the book title and author. Return ONLY a JSON response in the format: {"title": "Book Title", "author": "Author Name"} without any markdown formatting.',
            images: [base64Image],
          },
        ],
      });

      // Claude returns the response in the content array
      const content = response.message.content || "{}";

      // Clean the response before parsing
      const cleanedContent = this.cleanJsonResponse(content);

      console.log("Raw Llama response:", content); // For debugging
      console.log("Cleaned Llama response:", cleanedContent); // For debugging

      const result = JSON.parse(cleanedContent);
      return {
        title: result.title || "Unknown Title",
        author: result.author || "Unknown Author",
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Llama processing error:", error);
      throw error;
    }
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
