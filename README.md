# Memora 🧠

**Your knowledge, understood — private by default.**

Memora is a local-first personal AI knowledge base built with React Native and Expo. It allows you to capture, index, and chat with your own data without it ever leaving your device.

## 🚀 Key Features

- **Multi-Modal Capture**:
  - **Voice**: Record and transcribe audio locally using **OpenAI Whisper** or via Gemini cloud fallback.
  - **PDFs**: Dual-engine ingestion (Digital + Vision OCR) for robust text extraction from any document.
  - **Images**: OCR-powered document scanning using **Google ML Kit**.
  - **Web**: Instant extraction of clean text and metadata from any URL.
- **Privacy-First AI**:
  - **Local LLM**: Run **Qwen 2.5 1.5B** directly on your device using `llama.rn` (JSI-powered).
  - **Hybrid Inference**: Switch between **LOCAL** (privacy) and **CLOUD** (speed/power via Gemini) modes seamlessly.
- **Intelligent RAG Chat**:
  - **Retrieval Augmented Generation**: Ask questions about your ingested notes, PDFs, and recordings.
  - **Contextual Search**: High-performance local search across chunked knowledge using SQLite.
  - **Hallucination Protection**: AI-driven verification ensures answers are grounded in your actual data.
- **Local Persistence**:
  - Full offline capability using **SQLite** (`expo-sqlite`) for all knowledge and chat history.

## 🛠️ Tech Stack

- **Framework**: Expo SDK 57 (React Native 0.86, React 19)
- **Language**: TypeScript
- **State Management**: Zustand (with Persist for local storage)
- **Navigation**: Expo Router (File-based navigation)
- **AI Engines**:
  - `llama.rn` (Local LLM)
  - `whisper.rn` (Local Speech-to-Text)
  - Gemini API (Cloud Fallback)
- **OCR/Vision**:
  - ML Kit (via `@dariyd/react-native-text-recognition`)
  - `expo-pdf-text-extract`

## 📦 Getting Started

### Prerequisites
- Node.js >= 20
- Android Studio / Xcode (for native development)
- Android SDK 35+

### Installation
1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    - Create a `.env` file and add your `EXPO_PUBLIC_GEMINI_API_KEY`.
3.  **Local Properties (Android)**:
    - Ensure `android/local.properties` points to your Android SDK:
      `sdk.dir=C:/Users/<User>/AppData/Local/Android/Sdk`
4.  **Run Application**:
    ```bash
    npx expo run:android # or run:ios
    ```

## 🧪 Testing & Quality
The project maintains a high quality bar with a comprehensive test suite covering core logic, stores, and adapters.

- **Status**: ✅ All 160+ tests passing
- **Code Coverage**: **>82%**
- **Run Tests**:
  ```bash
  npm test
  # For coverage report:
  npm test -- --coverage
  ```

## 📜 Architecture
Memora follows a clean-architecture pattern with clear separation between:
- **Features**: Domain logic for Chat, Knowledge, Home, etc.
- **AI Adapters**: Interface-driven providers for LLM and STT engines.
- **Platform Adapters**: Cross-platform abstractions for FileSystem, Camera, and Microphone.
