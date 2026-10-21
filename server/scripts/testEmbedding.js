
const { Ollama } = require("ollama");

const ollama = new Ollama({ host: "http://localhost:11434" });

async function testEmbedding() {
  try {
    const response = await ollama.embed({
      model: "qwen3-embedding:4b",
      input: "This is a test sentence for vector search."
    });

    console.log("Embedding dimensions:", response.embeddings[0].length);
    console.log("Embedding test successful!");
  } catch (error) {
    console.error("Embedding test failed:", error.message);
  }
}

testEmbedding();
