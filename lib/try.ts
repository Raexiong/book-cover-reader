require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const { readFile } = require('fs/promises');
const path = require('path');

async function extractBookInfo(imagePath: string) {
    try {
        const imageBuffer = await readFile(imagePath);
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);

        const response = await hf.visualQuestionAnswering({
            inputs: {
                image: blob,
                question: "What is the title and author of this book?"
            },
            model: "ollama/llava"
        });

        const text = response.answer;
        
        let title: string | undefined;
        let author: string | undefined;
        
        if (text.toLowerCase().includes('title:')) {
            title = text.split('title:')[1].split('\n')[0].trim();
        }
        if (text.toLowerCase().includes('author:')) {
            author = text.split('author:')[1].split('\n')[0].trim();
        }

        return { title, author };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function main() {
    const imagePath = path.join(process.cwd(), "/lib/1.JPG");
    try {
        const bookInfo = await extractBookInfo(imagePath);
        console.log('Extracted Information:', bookInfo);
    } catch (error) {
        console.error('Failed to process image:', error);
    }
}

main();