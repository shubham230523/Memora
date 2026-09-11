# Memora Integration Testing System Plan

Create a comprehensive, device-free integration testing system for Memora that verifies multiple real application components working together using high-fidelity test doubles for platform boundaries.

## User Review Required

> [!IMPORTANT]
> The integration tests will run in a pure Node.js environment. We will implement a **Stateful In-Memory SQLite Double** that actually tracks data in memory. This is superior to standard mocks as it allows testing real repository and pipeline logic (e.g., verifying that a note created via `NoteRepository` is actually searchable via `KnowledgeRepository`).

> [!NOTE]
> No real AI models will be downloaded or executed. We will use a deterministic **TestAIProvider** that can be programmed to return specific responses for testing RAG, summaries, flashcards, and quizzes.

## Proposed Changes

### Integration Infrastructure

#### [NEW] [IntegrationTestDb.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/helpers/IntegrationTestDb.ts)
A state-tracking relational database double that implements the `expo-sqlite` interface. It will support basic SQL operations (`INSERT`, `UPDATE`, `DELETE`, `SELECT` with filtering/ordering) using an in-memory object store.

#### [NEW] [TestAIProvider.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/helpers/TestAIProvider.ts)
A deterministic AI provider implementation for testing RAG and structured output generation without external API calls or local model execution.

#### [NEW] [setup.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/setup.ts)
Integration-specific Jest setup file that replaces `Platform` adapters and database boundaries with high-fidelity test doubles.

---

### Integration Test Suites

#### [NEW] [Database.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/database/Database.test.ts)
Verifies the schema initialization, migrations, and basic relational integrity using the stateful test DB.

#### [NEW] [Notes.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/notes/Notes.test.ts)
Tests the full lifecycle of a Note: `Create` -> `Persist` -> `Retrieve` -> `Update` -> `Search` -> `Delete`.

#### [NEW] [Search.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/search/Search.test.ts)
Tests the `SearchStore` and `KnowledgeRepository` integration, including keyword matching and result ranking.

#### [NEW] [Ingestion.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/knowledge/Ingestion.test.ts)
Tests `KnowledgePipeline` integration: PDF fixture processing -> Text extraction -> Chunking -> Persistence -> Verification.

#### [NEW] [RAG.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/rag/RAG.test.ts)
Tests the complete RAG flow in `ChatStore`: User Query -> Retrieval -> Context Construction -> AI Answer -> Message Persistence.

#### [NEW] [Learning.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/learning/Learning.test.ts)
Tests the generation and validation of Flashcards, Quizzes, and Summaries using deterministic AI outputs.

#### [NEW] [Platform.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Memora/tests/integration/platform/Platform.test.ts)
Tests provider switching, model manager lifecycle states, and offline behavior handling.

---

### Configuration

#### [MODIFY] [package.json](file:///C:/Users/shubham/Documents/ReactNative/Memora/package.json)
Add the `test:integration` script: `"test:integration": "jest tests/integration --config=jest.config.js"`.

## Verification Plan

### Automated Tests
- Run `npm run test:integration` and verify all tests pass in a clean terminal environment.
- Verify zero network calls are made during the suite.
- Verify no emulator/device is required.

### Manual Verification
- Inspect the logs to ensure the stateful DB engine is correctly intercepting and processing production SQL queries.
