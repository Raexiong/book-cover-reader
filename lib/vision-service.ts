import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import path from "path";
import { AutoModelForCausalLM, AutoTokenizer } from "@huggingface/transformers";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const anthropic = new Anthropic({
//   apiKey: process.env.CLAUDE_API_KEY,
// });

interface BookRecognitionResult {
  title: string;
  author: string;
  confidence?: number;
}

export async function recognizeBookCover(
  imagePath: string,
  model: string
): Promise<BookRecognitionResult> {
  // Convert local path to base64 for API requests
  const fullPath = path.join(process.cwd(), "public", imagePath);
  const imageBuffer = readFileSync(fullPath);
  const base64Image = imageBuffer.toString("base64");
  console.log("base64Image", base64Image);
  switch (model) {
    case "openai":
      return await recognizeWithOpenAI(base64Image);
    case "claude":
      return await recognizeWithClaude(base64Image);
    case "llama":
      return await recognizeWithLlama(base64Image);
    case "moondream":
      return await recognizeWithMoondream(base64Image);
    default:
      throw new Error("Unsupported model");
  }
}

async function recognizeWithOpenAI(
  base64Image: string
): Promise<BookRecognitionResult> {
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4-vision-preview",
  //   messages: [
  //     {
  //       role: "user",
  //       content: [
  //         { type: "text", text: "Please extract the book title and author from this book cover image. Respond in JSON format with 'title' and 'author' fields only." },
  //         {
  //           type: "image_url",
  //           image_url: {
  //             url: `data:image/jpeg;base64,${base64Image}`
  //           }
  //         }
  //       ],
  //     },
  //   ],
  //   max_tokens: 300,
  // });

  // const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    title: "OpenAI - Unknown Title",
    author: "OpenAI -Unknown Author",
    confidence: 0.9,
  };
}

async function recognizeWithClaude(
  base64Image: string
): Promise<BookRecognitionResult> {
  // const response = await anthropic.messages.create({
  //   model: "claude-3-opus-20240229",
  //   max_tokens: 300,
  //   messages: [{
  //     role: "user",
  //     content: [
  //       {
  //         type: "text",
  //         text: "Please extract the book title and author from this book cover image. Respond in JSON format with 'title' and 'author' fields only."
  //       },
  //       {
  //         type: "image",
  //         source: {
  //           type: "base64",
  //           media_type: "image/jpeg",
  //           data: base64Image
  //         }
  //       }
  //     ]
  //   }]
  // });

  // const result = JSON.parse(response.content[0].text || '{}');
  return {
    title: "Claude - Unknown Title",
    author: "Claude - Unknown Author",
    confidence: 0.9,
  };
}

async function recognizeWithLlama(
  base64Image: string
): Promise<BookRecognitionResult> {
  return {
    title: "Llama - Unknown Title",
    author: "Llama - Unknown Author",
    confidence: 0.5,
  };
}

async function recognizeWithMoondream(
  base64Image: string
): Promise<BookRecognitionResult> {
  console.log("base64Image", base64Image);

  const model_id = "vikhyatk/moondream2";
  const revision = "2024-08-26";
  const model = AutoModelForCausalLM.from_pretrained(model_id, {
    revision: revision,
  });
  const tokenizer = AutoTokenizer.from_pretrained(model_id, {
    revision: revision,
  });

  console.log("model", model);
  console.log("tokenizer", tokenizer);

  const enc_image = model.encode_image(base64Image);

  const result = model.answer_question(
    enc_image,
    "What's the title and author of this book cover",
    tokenizer
  );
  console.log(result);

  return {
    title: "MoonDream - Unknown Title",
    author: "MoonDream - Unknown Author",
    confidence: 0.5,
  };
}
