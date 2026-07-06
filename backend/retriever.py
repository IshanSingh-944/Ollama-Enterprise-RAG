from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from ingestor import get_vector_store
import os

# Configuration for Ollama
OLLAMA_MODEL = "llama3" # You can change this to "medllama2" if you have it pulled
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

# Custom System Prompt tailored for Medical Data (Domain Agnostic, but strict)
RAG_PROMPT_TEMPLATE = """
You are an expert AI assistant. You have been provided with context from authoritative documents (e.g., medical papers).
Answer the user's question based ONLY on the provided context. If you cannot find the answer in the context, do not guess. Simply state that the information is not present in the provided documents.

Context:
{context}

User Question: {question}

Answer:
"""

def get_llm():
    """Initializes the connection to the local Ollama instance."""
    return Ollama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=0.1, # Low temperature for factual RAG
    )

def generate_rag_response(query: str):
    """
    Performs retrieval from ChromaDB and generates an answer using Ollama.
    """
    # 1. Retrieve relevant chunks
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 5}) # Get top 5 most relevant chunks
    
    docs = retriever.invoke(query)
    
    # 2. Format the context and extract sources
    context = "\n\n".join([doc.page_content for doc in docs])
    
    # Extract unique sources to cite in the UI
    sources = set()
    for doc in docs:
        source_name = doc.metadata.get("source", "Unknown Document")
        sources.add(source_name)
    
    # 3. Generate Answer
    llm = get_llm()
    prompt = PromptTemplate(
        template=RAG_PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )
    
    # Create the final prompt string
    final_prompt = prompt.format(context=context, question=query)
    
    # Call Ollama
    answer = llm.invoke(final_prompt)
    
    return {
        "answer": answer,
        "sources": list(sources)
    }
