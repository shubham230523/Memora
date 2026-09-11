# Recall 🧠

**Your knowledge, remembered.**

Recall is a personal AI knowledge OS built with React Native and Expo.

## Features
- **Capture everything**: Notes, PDFs, Images, Voice, Webpages.
- **AI-Powered Library**: Structured knowledge with auto-summarization and concept extraction.
- **RAG Chat**: Ask questions about your own knowledge base.
- **Knowledge Graph**: Discover relationships between your concepts.
- **Learning Suite**: AI-generated flashcards and quizzes based on your content.
- **Offline First**: Full local functionality with background synchronization.

## Tech Stack
- **Frontend**: React Native, Expo, TypeScript, Zustand, TanStack Query.
- **Database**: SQLite (expo-sqlite).
- **AI**: OpenRouter, Gemini, Ollama.
- **Backend**: Kotlin, Ktor, PostgreSQL (pgvector).

## Getting Started

### Prerequisites
- Node.js >= 20
- npm or yarn
- Expo Go (for mobile preview)

### Installation
1. Clone the repository.
2. Install dependencies: `npm install --legacy-peer-deps`
3. Create a `.env` file from `.env.example` and add your API keys.
4. Start the app: `npx expo start`

### Testing
Run unit tests: `npm test`

## Architecture
See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.
