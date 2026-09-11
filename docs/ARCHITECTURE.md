# Memora Architecture Plan

## 1. Directory Structure
```text
src/
├── app/            # Expo Router entry points and routes
├── core/           # Cross-cutting concerns (logging, config, errors)
├── navigation/     # Navigation types and utilities
├── design/         # Design system (tokens, components, themes)
├── platform/       # Platform abstractions (Camera, Storage, etc.)
├── shared/         # Shared utilities and hooks
├── features/       # Feature-based modules
│   ├── auth/
│   ├── knowledge/
│   ├── notes/
│   ├── search/
│   ├── chat/
│   └── ...
├── database/       # SQLite schema, migrations, and repository
├── api/            # API clients and types
└── ai/             # AI provider adapters and RAG logic
```

## 2. Key Technologies
- **Framework**: Expo (React Native)
- **State Management**: Zustand (App state), TanStack Query (Server/Async state)
- **Forms**: React Hook Form + Zod
- **Database**: `expo-sqlite`
- **AI**: OpenRouter / Gemini / Ollama via Adapter Pattern

## 3. Knowledge Pipeline
1. **Capture**: UI/API input.
2. **Processing**: Normalization, Metadata extraction.
3. **Chunking**: Semantic or size-based splitting.
4. **Vectorization**: Embedding generation (handled by AI service).
5. **Storage**: SQLite for metadata + Backend for vectors/embeddings.
6. **Search**: Keyword (Local) + Semantic (Backend/AI).

## 4. Platform Abstraction Layer
All native capabilities will be behind interfaces:
- `CameraProvider`
- `SecureStorageProvider`
- `FilePickerProvider`
- `FileSystemProvider`

This ensures business logic is platform-agnostic and testable.
