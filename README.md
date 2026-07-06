# Enterprise RAG Application

An advanced, domain-agnostic Retrieval-Augmented Generation (RAG) system built to provide precise, context-grounded answers from authoritative documents (like medical papers, financial reports, or technical manuals).

This project demonstrates a production-ready, decoupled architecture combining a high-performance Python backend with a premium React frontend.

## 🌟 Key Features

- **Local & Private Generation**: Uses [Ollama](https://ollama.com/) (e.g., Llama 3) to run models entirely locally, ensuring sensitive data never leaves your machine.
- **Advanced Retrieval Pipeline**: Implements semantic chunking (LangChain) and vector search using a local ChromaDB instance.
- **Hallucination Prevention**: Employs strict prompt engineering to force the LLM to answer *only* based on the retrieved context.
- **Transparent Citations**: The UI explicitly displays the source documents used to generate every answer.
- **Premium Glassmorphism UI**: Built with Next.js, featuring a custom dark-mode design system and responsive chat interface.
- **Fully Containerized**: 1-click setup using Docker Compose.

## 🏗️ Architecture Stack

- **Backend**: Python 3.11, FastAPI, LangChain, HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`)
- **Vector Database**: ChromaDB (Persistent)
- **LLM**: Ollama
- **Frontend**: Next.js (App Router), React, Vanilla CSS (Design Tokens)
- **Infrastructure**: Docker, Docker Compose

## 🚀 Quickstart Guide

### Prerequisites
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Install [Ollama](https://ollama.com/) and ensure it is running.
3. Pull your desired model into Ollama:
   ```bash
   ollama run llama3
   ```

### Running the Application
Spin up the entire stack (FastAPI Backend, ChromaDB, and Next.js Frontend) using Docker:

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Start the services
docker-compose up --build
```

- The **Frontend UI** will be available at: `http://localhost:3000`
- The **Backend API** (and Swagger Docs) will be available at: `http://localhost:8000/docs`

## 📂 Project Structure

```text
.
├── backend/
│   ├── main.py              # FastAPI application and endpoints
│   ├── ingestor.py          # PDF loading, chunking, and ChromaDB ingestion
│   ├── retriever.py         # Semantic search and Ollama generation logic
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend container setup
├── frontend/
│   ├── src/app/page.tsx     # Main Next.js chat interface
│   ├── src/app/globals.css  # Premium design system tokens
│   ├── next.config.ts       # Next.js standalone configuration
│   └── Dockerfile           # Frontend container setup
├── docker-compose.yml       # Orchestrates the decoupled services
└── README.md
```

## 📝 Usage

1. Open `http://localhost:3000` in your browser.
2. Use the **Knowledge Base** panel on the left to upload PDF documents (e.g., medical research papers).
3. Wait for the success message confirming the document was chunked and vectorized.
4. Ask a question in the main chat interface. The engine will retrieve the most relevant chunks and generate a cited response.

## 📄 License
This project is licensed under the MIT License.
