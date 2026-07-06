import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Configuration
CHROMA_DB_DIR = "./chroma_db"
# Using a good embedding model for medical/general text
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def get_embeddings():
    """Returns the HuggingFace embedding model."""
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

def get_vector_store():
    """Returns the ChromaDB vector store instance."""
    embeddings = get_embeddings()
    return Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embeddings)

def process_and_ingest_pdf(file_path: str, filename: str):
    """
    Loads a PDF, chunks it, and ingests it into ChromaDB.
    """
    print(f"Starting ingestion for {filename}...")
    
    # 1. Load the PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages from {filename}.")
    
    # 2. Chunk the text
    # We use RecursiveCharacterTextSplitter for semantic chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    
    # Add metadata to each chunk so we know where it came from (for citations)
    for chunk in chunks:
        chunk.metadata["source"] = filename
    
    print(f"Created {len(chunks)} chunks.")
    
    # 3. Embed and store in ChromaDB
    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=CHROMA_DB_DIR
    )
    
    print(f"Successfully ingested {filename} into ChromaDB.")
    return len(chunks)
