# Recall 🧠 — Master Implementation Plan

Recall is a production-quality AI-powered personal knowledge management application. It allows users to capture notes, PDFs, images, voice, and web pages, processing them into structured knowledge accessible via AI search, chat (RAG), and a knowledge graph.

## User Review Required

> [!IMPORTANT]
> This plan follows a strictly sequential 41-phase, 715-step process. We will proceed using TDD (Red-Green-Refactor) and commit frequently.

> [!WARNING]
> The project currently uses Expo v57.0.0 and React Native 0.86.3. All dependencies must be compatible with these versions.

> [!CAUTION]
> AI features require API keys (OpenRouter, Gemini, etc.). These must NEVER be committed to the repository and will be managed via environment variables.

## Proposed Changes

The project will follow a feature-oriented architecture within the `src/` directory.

### Core & Foundation
- **TypeScript**: Enforce strict typing.
- **Environment**: Secure config management (`.env`).
- **Utilities**: Logging, Error handling, Result types.

### Design System
- **Tokens**: Colors, Typography, Spacing.
- **Components**: Button, TextInput, Card, Loading, ErrorState, EmptyState, Dialog, BottomSheet.
- **Theming**: Light, Dark, System themes.

### Navigation
- **Structure**: Expo Router based navigation for Auth, Home, Knowledge, Search, Chat, Learning, Settings.
- **Deep Linking**: Full support for cross-platform deep links.

### Data Layer
- **Models**: User, KnowledgeItem, Tag, Concept, Relationship, Chunk, Citation, Conversation, Message, Quiz, Flashcard.
- **Local DB**: SQLite-based (e.g., `expo-sqlite`) for all platforms.
- **Sync**: Offline-first synchronization with a Ktor backend.

### Knowledge Ingestion (Pipeline)
- **Notes**: Text capture and editing.
- **PDFs**: Text extraction and chunking.
- **Images/Screenshots**: OCR integration.
- **Voice**: Recording and Transcription (STT).
- **Webpages**: Content extraction and normalization.

### AI & Search
- **Providers**: OpenRouter, Gemini, Ollama (via adapters).
- **RAG**: Hybrid search (Keyword + Semantic), Context construction, Citation generation.
- **Chat**: Streaming responses with citations.
- **Graph**: Concept and relationship extraction.

### Learning System
- **Flashcards**: AI-generated cards.
- **Quizzes**: AI-generated MCQ/Short-answer questions.
- **Gap Detection**: Identification of weak or missing knowledge.
- **Learning Agent**: Personalized roadmaps and daily tasks.

### Platform Support
- **Android/iOS**: Native capabilities (Camera, Microphone, Secure Storage).
- **Web/Desktop**: Responsive layouts and file system access.

## Verification Plan

### Automated Tests
- **Unit/Integration**: Jest and React Native Testing Library.
- **E2E**: Detox or equivalent for Expo/Mobile; Playwright for Web.
- **Backend**: Ktor testing framework.

### Manual Verification
- **Cross-Platform**: Validation on Android, iOS, Web, and Desktop.
- **AI Reliability**: Controlled test knowledge base to verify RAG accuracy and hallucination resistance.
- **Data Integrity**: Migration and sync conflict resolution testing.
