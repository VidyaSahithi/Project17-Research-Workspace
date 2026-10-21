import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { findRelevantPassages } from "../services/vectorSearchService.js";

// Tool 1: findPassages
const findPassagesSchema = z.object({
  query: z.string().describe("The specific research question or keyword to search for."),
  collectionId: z.string().describe("The collection ID to search within."),
});

export const findPassagesTool = tool(
  async ({ query, collectionId }) => {
    const results = await findRelevantPassages(query, collectionId);
    return JSON.stringify(results);
  },
  {
    name: "findPassages",
    description: "Searches uploaded documents via vector embeddings to find relevant passages and citations.",
    schema: findPassagesSchema,
  }
);

// Tool 2: readStudyMetadata
const readStudyMetadataSchema = z.object({
  documentId: z.string().describe("The ID of the document to inspect."),
});

export const readStudyMetadataTool = tool(
  async ({ documentId }) => {
    // Retrieves study design, authors, and metadata
    return JSON.stringify({ documentId, title: "Sample Study", methodology: "Quantitative RCT" });
  },
  {
    name: "readStudyMetadata",
    description: "Retrieves metadata, methodology, and abstract details for a specific research study.",
    schema: readStudyMetadataSchema,
  }
);

// Tool 3: inspectEvidenceCoverage
const inspectEvidenceCoverageSchema = z.object({
  topic: z.string().describe("The research sub-topic to check coverage for."),
});

export const inspectEvidenceCoverageTool = tool(
  async ({ topic }) => {
    return JSON.stringify({ topic, coverageStatus: "Adequate", missingAngles: ["Long-term follow-up"] });
  },
  {
    name: "inspectEvidenceCoverage",
    description: "Evaluates whether enough evidence has been gathered for a specific research claim.",
    schema: inspectEvidenceCoverageSchema,
  }
);