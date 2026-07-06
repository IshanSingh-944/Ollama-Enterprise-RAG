"use client";

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string, sources?: string[]}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newQuery = query;
    setQuery("");
    setChatHistory(prev => [...prev, { role: "user", content: newQuery }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: newQuery })
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      
      const data = await response.json();
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: data.answer, 
        sources: data.sources 
      }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, an error occurred while connecting to the RAG backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus(`Success: ${data.message}`);
      } else {
        setUploadStatus(`Error: ${data.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("Error connecting to server.");
    }
  };

  return (
    <main style={{ width: "100%", maxWidth: "1200px", display: "grid", gridTemplateColumns: "1fr 3fr", gap: "24px", padding: "40px" }}>
      
      {/* Sidebar - Document Management */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", height: "fit-content" }}>
        <h2>Knowledge Base</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Upload medical papers to expand the RAG context.</p>
        
        <label className="btn-primary" style={{ textAlign: "center", display: "block" }}>
          Upload PDF
          <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
        
        {uploadStatus && (
          <div style={{ fontSize: "0.85rem", marginTop: "8px", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)" }}>
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
        <div style={{ paddingBottom: "20px", borderBottom: "1px solid var(--border-color)", marginBottom: "20px" }}>
          <h1 style={{ margin: 0, color: "var(--accent-color)" }}>Cognitive RAG Engine</h1>
        </div>

        {/* Chat History */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "10px" }}>
          {chatHistory.length === 0 ? (
            <div style={{ margin: "auto", color: "var(--text-secondary)", textAlign: "center" }}>
              <h3>Welcome to the Advanced RAG Assistant</h3>
              <p>Upload a document and ask a question to begin.</p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "var(--accent-color)" : "rgba(30, 41, 59, 0.9)",
                color: msg.role === "user" ? "#0f172a" : "var(--text-primary)",
                padding: "16px",
                borderRadius: "12px",
                maxWidth: "80%",
                border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  {msg.role === "user" ? "You" : "RAG Engine"}
                </div>
                <div style={{ lineHeight: "1.5" }}>{msg.content}</div>
                
                {/* Citations UI */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.8rem" }}>
                    <strong>Sources Cited:</strong>
                    <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                      {msg.sources.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div style={{ alignSelf: "flex-start", padding: "16px" }}>
              <span className="loader"></span> Generating response...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleQuerySubmit} style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask a question about the medical papers..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" disabled={isLoading || !query.trim()}>
            Send
          </button>
        </form>
      </div>

    </main>
  );
}
