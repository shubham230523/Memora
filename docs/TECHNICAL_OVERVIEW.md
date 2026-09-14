# Memora: Technical Overview

Memora is a local-first, privacy-focused knowledge management app built with **React Native (Expo)**. It uses on-device AI for transcription, OCR refinement, and conversational retrieval.

## 🏗️ Architecture
Memora follows a **Layered Architecture** with a strong emphasis on **Platform Abstraction** to maintain clean boundaries between UI and native capabilities.

*   **UI Layer (`src/app`, `src/design`)**: Uses Expo Router for file-based navigation and a custom design system for consistent styling.
*   **Feature Layer (`src/features`)**: Contains domain-specific logic (e.g., `knowledge`, `home`, `chat`). This is where the "brains" of the features live.
*   **AI Layer (`src/ai`)**: Manages the lifecycle and state of on-device LLM (Qwen 2.5) and STT (Whisper) models.
*   **Platform Abstraction (`src/platform`)**: Provides an interface-based bridge to native modules (Camera, OCR, Storage, AI).
*   **Persistence Layer (`src/database`)**: Manages the local SQLite database and relational schemas.

---

## 🛠️ Tech Stack & Key Libraries
*   **Framework:** Expo (SDK 57) + React Native 0.86.
*   **Navigation:** Expo Router (Typed Routes enabled).
*   **State Management:** **Zustand** (Local-first, minimal boilerplate).
*   **Local AI:** `llama.rn` (LLM) and `whisper.rn` (Transcription).
*   **Database:** `expo-sqlite` (Relational storage).
*   **Styling:** Custom design tokens + `react-native-reanimated` for smooth UI transitions.

---

## 🔄 Knowledge Ingestion Pipeline
The `KnowledgePipeline` is the central orchestrator for getting data into the app.

1.  **Capture:** User provides a PDF, Image, Voice recording, or URL.
2.  **Extract:**
    *   **PDF:** Text extracted via `expo-pdf-text-extract`.
    *   **Image:** Native OCR (ML Kit) extracts raw text.
    *   **Voice:** `whisper.rn` transcribes audio to text locally.
3.  **Refine:** Local AI (LLM) cleans up OCR noise or summarizes the content.
4.  **Chunk & Store:** Text is split into **1000-character chunks** (with 200-char overlap) and saved to the `chunks` table in SQLite for future retrieval.

---

## 💾 Data Schema (SQLite)
Key tables in `db.ts`:
*   `knowledge_items`: The main entities (Type, Title, Content, Metadata).
*   `chunks`: Atomic segments of knowledge for AI context.
*   `tags` & `item_tags`: Relational tagging system.
*   `conversations` & `messages`: Local chat history with citations.
*   `concepts` & `relationships`: Foundation for a future "Knowledge Graph."

---

## 🤖 AI Lifecycle Management
AI models are heavy, so their state is managed globally via `useAIModelStore`:
*   **State Machine:** `NOT_INSTALLED` → `DOWNLOADING` → `READY` → `LOADING` → `LOADED`.
*   **Background Loading:** Models are pre-loaded on app launch (with a slight delay) to ensure zero-latency when the user opens the chat.
*   **Persistence:** Model metadata and settings are stored in `expo-secure-store`.

---

## 🔌 Platform Adapters
To support future web or desktop expansion, Memora uses a **Plugin Pattern**:
*   `src/platform/interfaces`: Defines the contract (e.g., `ILocalAIProvider`).
*   `src/platform/adapters`: Contains specific implementations (e.g., `LlamaLocalAI.ts` for native, `LlamaLocalAI.web.ts` for web).
*   **Injection:** `Platform.ts` exports the correct implementation for the current environment.

---

## 🚀 Future Improvements
*   **Vector Search:** Move from basic text search to `sqlite-vec` or similar for semantic retrieval.
*   **Graph Visualization:** Implement the `GraphRepository` logic in the UI to visualize concept relationships.
*   **WebGPU Support:** Implement the web adapters for Llama/Whisper using modern browser APIs.
