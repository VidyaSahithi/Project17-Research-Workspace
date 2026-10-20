
const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: "http://localhost:11434"
});

async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error("Text cannot be empty");
  }

  const response = await ollama.embed({
    model: "qwen3-embedding:4b",
    input: text
  });

  return response.embeddings[0];
}

module.exports = { generateEmbedding };
