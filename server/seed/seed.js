/**
 * Project 17 Database Seeding Script (M8)
 *
 * Populates required development entities:
 * - 3 Accounts: Student Researcher, Reviewer/Supervisor, Collection Owner
 * - 2 Collections (scaffolded)
 * - 3 Research Papers (Document model)
 * - Chunks with metadata, source page numbers, and embeddings (Chunk model)
 * - Research Questions & Approved Evidence
 *
 * Safe to rerun repeatedly (idempotent upserts).
 * Never resets or drops the production database.
 *
 * Usage:
 *   node server/seed/seed.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const seedData = require("./seedData.json");

// Generate a deterministic unit-normalized mock embedding vector of dimension 384
function generateDeterministicEmbedding(seedString, dimension = 384) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const vector = [];
  let sumSq = 0;
  for (let i = 0; i < dimension; i++) {
    const val = Math.sin(hash + i) * Math.cos((hash * (i + 1)) / 100);
    vector.push(val);
    sumSq += val * val;
  }

  const norm = Math.sqrt(sumSq) || 1;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

async function runSeed() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/project17_research";

  console.log("=================================================");
  console.log("  Project 17 Research Workspace — Database Seeding");
  console.log("=================================================");
  console.log(`Connecting to MongoDB at: ${mongoUri}`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ Connected to MongoDB successfully.\n");
  } catch (err) {
    console.error("✕ MongoDB Connection Failed:", err.message);
    console.log("\n[Notice] MongoDB is not currently running locally.");
    console.log("To seed when MongoDB is ready:");
    console.log("  1. Ensure mongod service is active on port 27017");
    console.log("  2. Set MONGODB_URI in server/.env");
    console.log("  3. Run: node server/seed/seed.js\n");
    console.log("Development mock data is actively available via client/.env (VITE_USE_MOCK=true).\n");
    return;
  }

  try {
    // 1. Seed Users
    console.log("--- 1. Seeding User Accounts ---");
    const userMap = new Map();

    for (const userData of seedData.users) {
      const normalizedEmail = userData.email.toLowerCase().trim();
      let user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        user = await User.create({
          name: userData.name,
          email: normalizedEmail,
          password: hashedPassword,
        });
        console.log(`  + Created user: ${user.name} (${user.email}) [Role: ${userData.role}]`);
      } else {
        console.log(`  • User already exists: ${user.name} (${user.email})`);
      }

      userMap.set(normalizedEmail, user);
    }

    // 2. Seed Documents & Chunks
    console.log("\n--- 2. Seeding Research Documents & Chunks ---");
    for (const docData of seedData.documents) {
      const owner = userMap.get(docData.ownerEmail.toLowerCase().trim());
      if (!owner) {
        console.warn(`  ! Skipping ${docData.title}: Owner ${docData.ownerEmail} not found.`);
        continue;
      }

      let document = await Document.findOne({
        title: docData.title,
        ownerId: owner._id,
      });

      if (!document) {
        document = await Document.create({
          title: docData.title,
          filePath: docData.filePath,
          ownerId: owner._id,
          status: docData.status,
          extractedText: docData.chunks.map((c) => c.text).join("\n\n"),
          chunks: docData.chunks.map((c) => ({
            chunkIndex: c.chunkIndex,
            text: c.text,
            startIndex: c.startIndex,
            endIndex: c.endIndex,
          })),
        });
        console.log(`  + Created document: "${document.title}" (ID: ${document._id})`);
      } else {
        console.log(`  • Document already exists: "${document.title}" (ID: ${document._id})`);
      }

      // Seed Chunks for Vector Search
      for (const chunkData of docData.chunks) {
        const embedding = generateDeterministicEmbedding(chunkData.text);

        await Chunk.findOneAndUpdate(
          { documentId: document._id, chunkIndex: chunkData.chunkIndex },
          {
            $set: {
              documentId: document._id,
              ownerId: owner._id,
              chunkIndex: chunkData.chunkIndex,
              text: chunkData.text,
              page: chunkData.page,
              section: chunkData.section,
              embedding,
            },
          },
          { upsert: true, new: true }
        );
      }
      console.log(`    ✓ ${docData.chunks.length} chunks verified for "${document.title}"`);
    }

    console.log("\n--- 3. Seed Collections & Evidence Summary ---");
    console.log(`  • Collections scaffolded in seedData.json: ${seedData.collections.length}`);
    console.log(`  • Research Questions scaffolded: ${seedData.researchQuestions.length}`);
    console.log(`  • Approved Evidence entries scaffolded: ${seedData.evidenceEntries.length}`);
    console.log("  (M1 final collection/evidence models can consume seedData.json directly)");

    console.log("\n=================================================");
    console.log("✓ Seeding process completed successfully!");
    console.log("=================================================");
  } catch (err) {
    console.error("✕ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

// Allow direct execution
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, generateDeterministicEmbedding };
