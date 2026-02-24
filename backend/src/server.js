import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Import routes
import analyzeRoutes from "./routes/analyze.js";
import downloadRoutes from "./routes/download.js";
import jobRoutes from "./routes/job.js";

// Import middleware
import { errorHandler } from "./utils/errorHandler.js";
import rateLimitMiddleware from "./middleware/rateLimiter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure temp directory exists
const tempDir = process.env.TEMP_DIR || "./temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/analyze", rateLimitMiddleware, analyzeRoutes);
app.use("/api/download", rateLimitMiddleware, downloadRoutes);
app.use("/api/job", jobRoutes);

// Serve static files from temp directory
app.use("/files", express.static(tempDir));

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`✅ StreamZip backend running on port ${PORT}`);
  console.log(`📁 Temp directory: ${path.resolve(tempDir)}`);
});

export default app;
