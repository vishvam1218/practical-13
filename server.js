/**
 * Practical 7: Authentication and Middleware Pipeline
 * Student Name : Vishvam Patel
 * Student ID   : 24IT110
 * Course       : Advanced Web Development Frameworks (ITUE301)
 * Institution  : CSPIT / DEPSTAR, CHARUSAT
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const logger = require('./src/middleware/logger');
const validateContentType = require('./src/middleware/contentTypeValidator');
const notFoundHandler = require('./src/middleware/notFoundHandler');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const containerRoutes = require('./src/routes/containerRoutes');
const ciRoutes = require('./src/routes/ciRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager_db';

let dbStatus = {
  connected: false,
  uri: MONGO_URI,
  mode: 'Schema-Validated Memory Store (Database Connecting...)'
};

// Connect to MongoDB with timeout fallback
const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    dbStatus.connected = true;
    dbStatus.mode = 'MongoDB Live Database';
    console.log(`✅ Practical 7: Connected to MongoDB at: ${MONGO_URI}`);
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.mode = 'Schema-Validated Memory Fallback (MongoDB Offline)';
    console.log(`ℹ️ Practical 7: MongoDB connection offline (${err.message}). Using Mongoose Schema-Validated store.`);
  }
};

// 1. Core middleware & CORS configuration
app.use(express.json());
app.use(cors());

// 2. Global middleware: Request logging
app.use(logger);

// 3. Global middleware: Content-Type validator
app.use(validateContentType);

// 4. API Summary Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    practicals: [
      "Practical 7: Authentication and Middleware Pipeline",
      "Practical 8: React Performance Optimization & Lazy Loading",
      "Practical 9: In-Memory Caching and Query Optimization",
      "Practical 10: Asynchronous Processing with Event-Driven Architecture",
      "Practical 11: Containerization with Docker and Docker Compose",
      "Practical 12: CI/CD Pipeline with GitHub Actions",
      "Practical 13: AI API Integration into a Web Application"
    ],
    student: "Vishvam Patel",
    studentId: "24IT110",
    course: "ITUE301 - Advanced Web Development Frameworks",
    architecture: {
      authFlow: "POST /auth/register -> bcrypt hash -> User document | POST /auth/login -> bcrypt verify -> JWT",
      pipeline: "Request -> Auth Middleware (Verify Bearer Token) -> Validation Middleware (Sanitize Input) -> Controller -> Response",
      cachingFlow: "GET /tasks -> node-cache Check -> HIT (return RAM in ~0.3ms) | MISS (query DB, store with TTL=60s) | Invalidate on POST/PUT/DELETE",
      eventDrivenFlow: "POST/PUT/DELETE /tasks -> Emit Event (EventEmitter) -> Instant HTTP Response (3ms) -> Async Workers (Audit, Email, Analytics)",
      containerFlow: "Docker Compose -> Bridge Network (awdf-network) -> Frontend (Nginx:80) -> Backend (Express:5001) -> Database (Mongo:27017) + Volume (awdf-mongo-storage)",
      ciCdFlow: "git push origin main -> GitHub Actions -> Job: lint (ESLint) -> Job: build-and-test (Node 20, Jest & Supertest) -> Green Checkmark (Pass) / Red X (Fail)",
      aiFlow: "React Frontend ('Auto-Generate') -> Express Backend (/api/ai/generate-description) -> OpenAI API (API Key in .env) -> Parse Response -> React UI (Graceful degradation on error)"
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      mode: mongoose.connection.readyState === 1 ? 'MongoDB Live Database' : dbStatus.mode
    },
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
      profile: "GET /auth/me (Protected)",
      tasks: "GET/POST/PUT/DELETE /tasks (Protected by JWT Auth & Validation)",
      cacheStats: "GET /tasks/cache/stats (Practical 9 Telemetry)",
      cacheClear: "POST /tasks/cache/clear (Practical 9 Cache Purge)",
      cacheConfig: "POST /tasks/cache/config (Practical 9 TTL & Toggle Config)",
      eventStats: "GET /tasks/events/stats (Practical 10 EDA Telemetry)",
      asyncJobs: "GET /tasks/events/jobs (Practical 10 Job Queue)",
      createJob: "POST /tasks/events/jobs (HTTP 202 Accepted Async Job)",
      syncVsAsyncBenchmark: "POST /tasks/benchmark/sync-vs-async (Practical 10 Latency Benchmark)",
      containerInfo: "GET /container/info (Practical 11 Docker & Compose Telemetry)",
      ciInfo: "GET /ci/info (Practical 12 GitHub Actions Pipeline Telemetry)",
      ciRun: "POST /ci/run (Practical 12 Interactive Pipeline & Test Runner)",
      aiGenerateDescription: "POST /api/ai/generate-description (Practical 13)",
      aiStatus: "GET /api/ai/status (Practical 13)"
    }
  });
});

// 5. Mount Authentication Routes
app.use('/auth', authRoutes);

// 6. Mount Task Routes (Protected by Auth Middleware inside taskRoutes)
app.use('/tasks', taskRoutes);

// 7. Mount Container Telemetry Routes (Practical 11)
app.use('/container', containerRoutes);

// 8. Mount CI/CD Pipeline Telemetry Routes (Practical 12)
app.use('/ci', ciRoutes);

// 9. Mount AI Service Routes (Practical 13) - support both /ai and /api/ai
app.use('/ai', aiRoutes);
app.use('/api/ai', aiRoutes);

// 10. Undefined Route Handler
app.use(notFoundHandler);

// 11. Global Error Handler
app.use(errorHandler);

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Practical 7, 8, 9 & 10: Server Running!`);
    console.log(`👤 Student: Vishvam Patel (ID: 24IT110)`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`⚡ In-Memory Cache: node-cache active (stdTTL: 60s)`);
    console.log(`📡 Event-Driven Engine: Node.js EventEmitter Active`);
    console.log(`📊 EDA Stats: http://localhost:${PORT}/tasks/events/stats`);
    console.log(`🛡️ Protected Routes: /tasks (JWT Auth & Input Validation)`);
    console.log(`=======================================================`);
    connectDatabase();
  });
}

module.exports = app;
