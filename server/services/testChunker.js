
const { chunkPages } = require("../services/chunker");

const pages = [
  {
    page: 1,
    section: "Introduction",
    text: "This is sample PDF text. ".repeat(100)
  },
  {
    page: 2,
    section: "Methods",
    text: "This is another page of sample text. ".repeat(50)
  }
];

const chunks = chunkPages(pages);

console.log("Total chunks:", chunks.length);
console.log("First chunk:", chunks[0]);
console.log("Last chunk:", chunks[chunks.length - 1]);

if (
  chunks.length > 0 &&
  chunks[0].page === 1 &&
  chunks.some(chunk => chunk.page === 2)
) {
  console.log("Chunker test successful!");
} else {
  console.log("Chunker test failed!");
}
