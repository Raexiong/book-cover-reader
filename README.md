# ReMo-XYZ: Book Cover Recognition App

A Next.js application that allows users to upload book covers and recognize book information using AI models. Users can manage their book library, edit recognized information, and delete books as needed.

## Features

- 📚 Upload and recognize book covers
- 🤖 Multiple AI model options (mock implementation)
- 📝 Edit recognized book information
- 🗃️ View and manage book library
- 🖼️ Image upload with drag-and-drop support
- 🎨 Modern UI with Tailwind CSS and shadcn/ui

## Prerequisites

Before you begin, ensure you have installed:

- Node.js 18.17 or later
- npm (comes with Node.js)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Raexiong/book-cover-scanner.git
cd book-cover-scanner
```

2. Install dependencies:

```bash
npm install
```

3. Create required directories:

```bash
mkdir public/uploads
```

## Model Setup

1. To use the ‘Claude API’ and ‘OpenAI API’, create a .env.local file. Then store your own API keys in the file:

```
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
```

2. To use the `Llama3.2-vision` model, download and install [Ollama](https://ollama.com/download). Then run

```
ollama pull llama3.2-vision
ollama serve
```

## Development

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

Now you can use the model in your browser by click `Process Images`. Be patient while processing :)

## Project Structure

```
remo-xyz/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── library/             # Library page
│   ├── page.tsx             # Home page
│   └── layout.tsx           # Root layout
├── components/              # React components
├── data/                    # JSON data storage
├── lib/                     # Utility functions
├── public/                  # Static files
│   └── uploads/            # Uploaded images
└── types/                  # TypeScript types
```

## Important Notes

- The `data` directory must have write permissions for storing book information
- The `public/uploads` directory must have write permissions for storing images
- The current implementation uses mock AI responses for book recognition
- All data is stored locally in the `data/books.json` file
- Uploaded images are stored in `public/uploads`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

### Scan Page

- Upload book covers via drag-and-drop or file selection
- Choose from multiple AI models for recognition
- Edit recognized information before saving
- Add books to your library

### Library Page

- View all saved books
- Delete books from library
- See book details including cover image, title, author, and date added

## Technical Implementation

- Built with Next.js 14 and TypeScript
- Uses App Router and Server Components
- UI components from shadcn/ui
- Styling with Tailwind CSS
- Local file storage for images and data

## Customization

You can modify the mock AI models in `app/api/process-image/route.ts` to:

- Add new models
- Change recognition patterns
- Adjust response timing
- Modify confidence scores

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
