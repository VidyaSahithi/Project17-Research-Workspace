import { z } from "zod";

export const evidenceSchema = z.object({
  studyQuestion: z.string().describe("The main research question or objective stated in the paper."),
  methods: z.string().describe("The methodology or experimental design used."),
  findings: z.string().describe("The key results or findings discovered."),
  limitations: z.string().describe("The study limitations noted by authors, or 'Not found' if omitted."),
  page: z.number().describe("The source page number where this information is found.")
});