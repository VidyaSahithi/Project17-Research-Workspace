import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import dotenv from "dotenv";

dotenv.config();

// Initialize the local Ollama LLM with 127.0.0.1 to prevent hanging
export const llm = new ChatOllama({
  baseUrl: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
  model: process.env.CHAT_MODEL || "llama3",
  temperature: 0.2,
});

export const embeddings = new OllamaEmbeddings({
  baseUrl: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
  model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
});