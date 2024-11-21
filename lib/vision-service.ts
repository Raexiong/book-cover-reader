
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

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
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  const imageBuffer = readFileSync(fullPath);
  const base64Image = imageBuffer.toString('base64');

  switch (model) {
    case 'openai':
      return await recognizeWithOpenAI(base64Image);
    case 'claude':
      return await recognizeWithClaude(base64Image);
    case 'llama':
      return await recognizeWithLlama(base64Image);
    case 'moondream':
      return await recognizeWithMoondream(base64Image);
    default:
      throw new Error('Unsupported model');
  }
}

async function recognizeWithOpenAI(base64Image: string): Promise<BookRecognitionResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Please extract the book title and author from this book cover image. Respond in JSON format with 'title' and 'author' fields only." },
          { 
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    max_tokens: 300,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    title: result.title || 'Unknown Title',
    author: result.author || 'Unknown Author',
    confidence: 0.9
  };
}

async function recognizeWithClaude(base64Image: string): Promise<BookRecognitionResult> {
  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "Please extract the book title and author from this book cover image. Respond in JSON format with 'title' and 'author' fields only."
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  });

  const result = JSON.parse(response.content[0].text || '{}');
  return {
    title: result.title || 'Unknown Title',
    author: result.author || 'Unknown Author',
    confidence: 0.9
  };
}

async function recognizeWithLlama(base64Image: string): Promise<BookRecognitionResult> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: base64Image,
            text: "You are a book cover analyzer. Look at this book cover image and extract the title and author. Your response should be in valid JSON format like this: {\"title\": \"Book Title\", \"author\": \"Author Name\"}"
          }
        }),
      }
    );

    const result = await response.json();
    
    // Log the raw response for debugging
    console.log('Llama raw response:', result);

    // Check if we have a response
    if (!result || !result.generated_text) {
      console.error('No valid response from Llama');
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        confidence: 0.5
      };
    }

    // Try to extract JSON from the response text
    const jsonMatch = result.generated_text.match(/\{.*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Unknown Title',
        author: parsed.author || 'Unknown Author',
        confidence: 0.8
      };
    }

    // If no JSON found, try to extract information from plain text
    const text = result.generated_text;
    return {
      title: text.includes('title:') ? 
        text.split('title:')[1].split('\n')[0].trim() : 'Unknown Title',
      author: text.includes('author:') ? 
        text.split('author:')[1].split('\n')[0].trim() : 'Unknown Author',
      confidence: 0.6
    };

  } catch (error) {
    console.error('Error processing Llama response:', error);
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      confidence: 0.5
    };
  }
}

async function recognizeWithMoondream(base64Image: string): Promise<BookRecognitionResult> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/vikhyatk/moondream2",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: base64Image,
            question: "Extract and return the book title and author from this book cover. Return the response in JSON format with 'title' and 'author' fields only."
          }
        }),
      }
    );

    const result = await response.json();
    console.log('Moondream raw response:', result);

    // Handle various response formats
    if (result.error) {
      console.error('Moondream error:', result.error);
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        confidence: 0.5
      };
    }

    try {
      // Try to parse JSON from the response
      const jsonMatch = result.generated_text?.match(/\{.*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || 'Unknown Title',
          author: parsed.author || 'Unknown Author',
          confidence: 0.8
        };
      }

      // If no JSON, try to extract from plain text
      const text = result.generated_text || '';
      const titleMatch = text.match(/title:?\s*([^\n]+)/i);
      const authorMatch = text.match(/author:?\s*([^\n]+)/i);

      return {
        title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
        author: authorMatch ? authorMatch[1].trim() : 'Unknown Author',
        confidence: 0.7
      };

    } catch (parseError) {
      console.error('Failed to parse Moondream response:', parseError);
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        confidence: 0.5
      };
    }

  } catch (error) {
    console.error('Error processing Moondream response:', error);
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      confidence: 0.5
    };
  }
}



async function recognizeWithLlamaTry(base64Image: string): Promise<BookRecognitionResult> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: base64Image,
            text: "You are a book cover analyzer. Look at this book cover image and extract the title and author. Your response should be in valid JSON format like this: {\"title\": \"Book Title\", \"author\": \"Author Name\"}"
          }
        }),
      }
    );

    const result = await response.json();
    
    // Log the raw response for debugging
    console.log('Llama raw response:', result);

    // Check if we have a response
    if (!result || !result.generated_text) {
      console.error('No valid response from Llama');
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        confidence: 0.5
      };
    }

    // Try to extract JSON from the response text
    const jsonMatch = result.generated_text.match(/\{.*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Unknown Title',
        author: parsed.author || 'Unknown Author',
        confidence: 0.8
      };
    }

    // If no JSON found, try to extract information from plain text
    const text = result.generated_text;
    return {
      title: text.includes('title:') ? 
        text.split('title:')[1].split('\n')[0].trim() : 'Unknown Title',
      author: text.includes('author:') ? 
        text.split('author:')[1].split('\n')[0].trim() : 'Unknown Author',
      confidence: 0.6
    };

  } catch (error) {
    console.error('Error processing Llama response:', error);
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      confidence: 0.5
    };
  }
}

