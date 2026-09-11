# Memora 🧠

### Your knowledge, understood.

**Memora** is an AI-powered personal knowledge system that transforms your notes, documents, screenshots, images, voice recordings, webpages, and code into a connected, searchable knowledge base.

Instead of asking an AI generic questions, Memora lets you **chat with your own knowledge**.

Capture something once.

Memora processes it, understands it, connects it with your existing knowledge, and makes it available whenever you need it.

---

## ✨ What is Memora?

Information is everywhere.

* Notes
* PDFs
* Screenshots
* Articles
* Documentation
* Voice recordings
* Code snippets
* Images
* Ideas

The problem isn't collecting information.

The problem is **remembering, connecting, and actually using it**.

Memora solves this by combining:

* AI
* Semantic Search
* Hybrid Search
* RAG
* Knowledge Graphs
* AI Agents
* Local Storage
* Offline-first architecture
* Cross-platform development

into a single personal knowledge system.

---

## 🎯 Core Idea

```text
                 ┌─────────────────┐
                 │     Capture     │
                 └────────┬────────┘
                          ↓
        ┌─────────────────────────────────┐
        │ Notes • PDFs • Images • Voice   │
        │ Webpages • Screenshots • Code   │
        └────────────────┬────────────────┘
                         ↓
                 ┌───────────────┐
                 │   Processing  │
                 └───────┬───────┘
                         ↓
              ┌─────────────────────┐
              │ Clean + Normalize   │
              │ Metadata + Chunking │
              │ Embeddings + OCR    │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Personal Knowledge  │
              │      Base           │
              └──────────┬──────────┘
                         ↓
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Search       Knowledge Graph    AI Chat
          ↓              ↓              ↓
          └──────────────┼──────────────┘
                         ↓
                  ┌─────────────┐
                  │   Learning  │
                  │    Agent    │
                  └─────────────┘
```

---

# 🚀 Features

## 📥 Capture Anything

Memora can turn different types of information into knowledge.

### Notes

Create and manage:

* Rich notes
* Tags
* Categories
* Favorites
* Summaries
* Concepts
* AI-generated metadata

### 📄 PDFs

Import PDFs and automatically:

* Extract text
* Detect pages and sections
* Clean content
* Split into chunks
* Generate embeddings
* Extract concepts
* Create searchable knowledge

Citations retain the original:

```text
Document
→ Page
→ Section
→ Chunk
```

### 🖼️ Images & Screenshots

Capture or import images.

Memora can:

* Run OCR
* Clean extracted text
* Detect useful metadata
* Extract concepts
* Generate embeddings
* Make screenshots searchable

### 🎙️ Voice

Record ideas directly inside Memora.

```text
Record
 ↓
Transcribe
 ↓
Clean
 ↓
Summarize
 ↓
Extract Concepts
 ↓
Generate Embeddings
 ↓
Searchable Knowledge
```

### 🌐 Webpages

Save a webpage URL and Memora can extract:

* Title
* Author
* Publication date
* Main content
* Relevant sections
* Metadata

The original URL is retained for citations.

### 💻 Code

Store code snippets and technical knowledge.

Memora can help:

* Explain code
* Summarize implementations
* Extract concepts
* Connect related technologies
* Generate questions
* Find related knowledge

---

# 🔎 Intelligent Search

Memora supports multiple search strategies.

### Keyword Search

Traditional exact/partial text matching.

### Semantic Search

Find knowledge based on meaning rather than exact words.

For example:

> "How do I handle asynchronous streams in Android?"

can find knowledge containing:

> Kotlin Flow, StateFlow, SharedFlow, Coroutines

even when the exact question was never written.

### Hybrid Search

Memora combines:

```text
Keyword Search
      +
Semantic Search
      +
Ranking
      +
Optional Reranking
```

to produce better results.

---

# 💬 Chat With Your Knowledge

The central feature of Memora.

Instead of:

> "Ask an AI anything."

Memora provides:

> **"Ask questions about what you know."**

Example:

```text
User:
How does StateFlow differ from SharedFlow?

Memora:
Based on your saved knowledge...

[Answer]

Sources:
📄 Kotlin Notes — Page 4
📝 Coroutines Notes
💻 FlowExample.kt
```

Responses distinguish between:

* **Found in your knowledge**
* **AI reasoning**
* **Not found in your knowledge**

Memora must never fabricate citations.

---

# 🔗 Knowledge Graph

Your knowledge isn't a collection of isolated documents.

Memora connects concepts together.

Example:

```text
Kotlin
  │
  ├── Coroutines
  │      │
  │      ├── Flow
  │      │    │
  │      │    ├── StateFlow
  │      │    └── SharedFlow
  │      │
  │      └── Structured Concurrency
  │
  └── Android
         │
         └── Jetpack Compose
```

Supported relationships include:

```text
RELATED_TO
PART_OF
PREREQUISITE_OF
SIMILAR_TO
CONTRASTS_WITH
USED_WITH
```

The graph continuously evolves as new knowledge is added.

---

# 🧠 AI Knowledge Processing

Every piece of captured information goes through a processing pipeline.

```text
Input
 ↓
Classification
 ↓
Extraction
 ↓
Normalization
 ↓
Metadata
 ↓
Chunking
 ↓
Embeddings
 ↓
Storage
 ↓
Indexing
 ↓
Concept Extraction
 ↓
Knowledge Graph
```

This turns raw information into structured knowledge.

---

# 🎓 Personal Learning Agent

Memora doesn't only store what you know.

It helps identify **what you don't know yet**.

The learning system can identify:

### Known

Concepts the user understands well.

### Weak

Concepts the user has encountered but struggles with.

### Missing

Concepts required to understand a topic but not yet present in the user's knowledge.

### Prerequisites

Concepts that should be learned before another concept.

Example:

```text
Goal:
Learn Distributed Systems

Memora discovers:

Networking
     ↓
HTTP
     ↓
Distributed Communication
     ↓
Consistency
     ↓
Replication
     ↓
Distributed Systems
```

It can then generate a personalized learning roadmap.

---

# 🃏 AI Flashcards

Generate flashcards directly from your knowledge.

Example:

```text
Question:
What is StateFlow?

        ↓

User answers

        ↓

Memora evaluates

        ↓

Known / Needs Review
```

Future versions can introduce spaced repetition.

---

# 📝 AI Quizzes

Generate quizzes from your existing knowledge.

Supported question types:

* Multiple choice
* True / False
* Short answer
* Code questions

Memora tracks:

* Score
* Topics
* Difficulty
* Mistakes
* Weak concepts
* Progress

Quiz results feed back into the learning system.

---

# 📊 Knowledge Gap Detection

Memora analyzes your knowledge graph, search behavior, quizzes, and learning activity to identify gaps.

Example:

```text
You know:

Kotlin
 ↓
Coroutines
 ↓
Flow
 ↓
StateFlow

But frequently struggle with:

SharedFlow
 ↓
Cold vs Hot Streams
 ↓
Backpressure
```

Memora can recommend these as areas to study.

---

# 📱 Cross-Platform

Memora is designed as a true React Native application.

Supported platforms:

* Android
* iOS
* Web
* Desktop

The goal is to maximize shared code while isolating platform-specific capabilities.

```text
                 Memora
                    │
          React Native + TypeScript
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   Android         iOS      Web/Desktop
       │            │            │
       └────────────┼────────────┘
                    ↓
             Shared Domain
                    ↓
              Shared API
                    ↓
               Ktor Backend
```

---

# 📴 Offline First

Memora is designed to work even when the network isn't available.

Users can:

* View knowledge
* Create notes
* Edit notes
* Search local knowledge
* View conversations
* Queue operations

When connectivity returns:

```text
Local Changes
      ↓
Sync Queue
      ↓
Backend
      ↓
Conflict Detection
      ↓
Conflict Resolution
      ↓
Synced
```

Memora must never silently overwrite user data.

---

# 🏗️ Architecture

## Client

```text
React Native
      │
      ├── Presentation
      │
      ├── Domain
      │
      ├── Data
      │
      ├── Local Database
      │
      ├── API Client
      │
      ├── AI Client
      │
      └── Platform Adapters
```

## Backend

```text
React Native Client
        │
        ↓
     Ktor API
        │
        ├── Authentication
        ├── Knowledge
        ├── Search
        ├── RAG
        ├── Conversations
        ├── Graph
        ├── Learning
        └── Sync
        │
        ↓
 PostgreSQL + pgvector
        │
        ├── Relational Data
        └── Vector Search
```

---

# 🛠️ Technology Stack

## Frontend

* React Native
* TypeScript
* React Native Web
* React Navigation
* TanStack Query
* Zustand
* React Hook Form
* Zod

## Testing

* Jest
* React Native Testing Library
* Detox or appropriate E2E tooling
* Backend integration tests

## Backend

* Kotlin
* Ktor
* PostgreSQL
* pgvector

## AI

Provider abstraction supporting:

* OpenRouter
* Gemini
* Ollama-compatible models

AI capabilities include:

* LLM generation
* Embeddings
* RAG
* Summarization
* Classification
* Concept extraction
* Quiz generation
* Flashcard generation
* Learning agents

Complex multi-step AI workflows may use LangGraph on the backend.

---

# 🧩 Platform Architecture

Platform-specific capabilities are isolated behind interfaces.

Example:

```text
FilePickerProvider
CameraProvider
MicrophoneProvider
FileSystemProvider
SecureStorageProvider
OCRProvider
NotificationProvider
BackgroundTaskProvider
```

Business logic never directly depends on:

```text
Android APIs
iOS APIs
Browser APIs
Desktop APIs
```

Instead:

```text
Domain
  ↓
Interface
  ↓
Platform Adapter
  ↓
Native Capability
```

---

# 🔐 Security

Security is a first-class requirement.

Memora must:

* Never hard-code API keys
* Never commit secrets
* Never store authentication tokens in insecure storage
* Never log sensitive user content unnecessarily
* Validate all user input
* Validate uploaded files
* Validate URLs
* Enforce authorization
* Protect user-owned resources
* Handle AI prompt injection
* Prevent untrusted documents from overriding system instructions

Environment variables are configured through secure deployment configuration.

An example environment file is provided:

```text
.env.example
```

No real secrets belong in the repository.

---

# 🧪 Testing Philosophy

Memora follows:

```text
RED
 ↓
GREEN
 ↓
REFACTOR
 ↓
VALIDATE
 ↓
COMMIT
 ↓
NEXT TASK
```

Every meaningful feature begins with tests.

Testing includes:

### Unit Tests

* Domain logic
* Use cases
* Repositories
* Search
* Ranking
* Sync
* AI response parsing

### Component Tests

* Screens
* Components
* Forms
* Loading states
* Error states
* Empty states

### Integration Tests

* Database
* API
* AI providers
* Search
* RAG
* Sync

### E2E Tests

Complete user journeys across platforms.

---

# 🔬 RAG Testing

RAG quality is tested independently.

Test cases include:

* Exact retrieval
* Semantic retrieval
* Hybrid retrieval
* Irrelevant documents
* Missing knowledge
* Citation accuracy
* Citation source mapping
* Prompt injection
* AI provider failure
* Streaming interruption
* Timeout
* Retry

Memora should never produce a citation that doesn't correspond to actual stored knowledge.

---

# 📂 Project Structure

```text
memora/
│
├── android/
├── ios/
├── web/
├── windows/
├── macos/
│
├── src/
│   ├── app/
│   ├── core/
│   ├── navigation/
│   ├── design/
│   ├── platform/
│   ├── database/
│   ├── api/
│   ├── ai/
│   │
│   └── features/
│       ├── auth/
│       ├── home/
│       ├── knowledge/
│       ├── notes/
│       ├── documents/
│       ├── images/
│       ├── voice/
│       ├── webpages/
│       ├── search/
│       ├── chat/
│       ├── graph/
│       ├── learning/
│       ├── flashcards/
│       ├── quizzes/
│       ├── sync/
│       └── settings/
│
├── backend/
│
├── docs/
│
├── tests/
│
├── README.md
├── ARCHITECTURE.md
├── AI_ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── TESTING.md
├── SECURITY.md
└── SYNC.md
```

---

# 🚧 Development Status

**Memora is currently under active development.**

The project is being developed incrementally using a test-driven development workflow.

The target is a production-quality application across:

```text
Android
iOS
Web
Desktop
```

---

# 🗺️ Roadmap

## Phase 1 — Foundation

* [x] Project architecture
* [x] React Native foundation
* [ ] Design system
* [ ] Navigation
* [ ] Local database

## Phase 2 — Knowledge Capture

* [ ] Notes
* [ ] PDFs
* [ ] Images
* [ ] Screenshots
* [ ] Voice
* [ ] Webpages
* [ ] Code

## Phase 3 — Intelligence

* [ ] Semantic search
* [ ] Hybrid search
* [ ] Embeddings
* [ ] RAG
* [ ] AI chat
* [ ] Citations

## Phase 4 — Knowledge Graph

* [ ] Concept extraction
* [ ] Relationship extraction
* [ ] Graph visualization
* [ ] Related knowledge

## Phase 5 — Learning

* [ ] Knowledge gaps
* [ ] Flashcards
* [ ] Quizzes
* [ ] Learning roadmap
* [ ] Learning agent

## Phase 6 — Platform

* [ ] Android
* [ ] iOS
* [ ] Web
* [ ] Desktop

## Phase 7 — Production

* [ ] Offline-first
* [ ] Synchronization
* [ ] Security audit
* [ ] Performance optimization
* [ ] Accessibility
* [ ] E2E testing
* [ ] Production builds

---

# 🧪 Example User Journey

### Capture

```text
User imports a PDF about Kotlin Coroutines.
```

### Processing

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Concept Extraction
 ↓
Knowledge Graph
```

### Search

User asks:

> "How does structured concurrency work?"

Memora finds relevant sections from the imported PDF and other saved knowledge.

### AI

The user asks:

> "Explain structured concurrency using what I've learned."

Memora generates an answer using the user's knowledge.

### Citation

The response contains:

```text
📄 Kotlin Coroutines.pdf
Page 12
```

The citation opens the original source.

### Learning

Memora notices the user struggles with coroutine cancellation.

It generates:

```text
Recommended topic:
Coroutine Cancellation

Prerequisite:
Structured Concurrency

Practice:
5-question quiz
```

The knowledge system continuously evolves.

---

# 🌟 Vision

Memora is more than a notes application.

It is intended to become a **personal knowledge intelligence layer**.

The long-term vision is:

```text
Everything you learn
        ↓
Everything you create
        ↓
Everything you save
        ↓
Everything you understand
        ↓
Connected Personal Knowledge
        ↓
AI that understands your context
        ↓
Personal Learning System
```

Instead of repeatedly searching the internet for information you have already encountered, Memora helps you **find, understand, connect, and remember your own knowledge**.

---

# 📜 License

License to be determined.

---

## Built with ❤️ using React Native, TypeScript, Kotlin, PostgreSQL and AI.
