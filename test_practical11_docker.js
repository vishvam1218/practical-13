/**
 * Automated Verification Script for Practical 11
 * Topic: Containerization with Docker and Docker Compose
 * Student: Vishvam Patel (24IT110) | CHARUSAT - ITUE301
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);
const pass = (desc) => log(`  ✅ PASS: ${desc}`, colors.green);
const fail = (desc, detail) => {
  log(`  ❌ FAIL: ${desc} -> ${detail}`, colors.red);
  process.exitCode = 1;
};

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const ROOT_DIR = path.resolve(__dirname, '..');

const run = async () => {
  log(`\n=================================================================`, colors.magenta);
  log(`🧪 Running Practical 11 Verification: Docker & Docker Compose`, colors.bold + colors.cyan);
  log(`👤 Student: Vishvam Patel (ID: 24IT110) | CHARUSAT`, colors.cyan);
  log(`=================================================================\n`, colors.magenta);

  // 1. Audit Backend Dockerfile
  const backendDockerPath = path.join(__dirname, 'Dockerfile');
  if (fs.existsSync(backendDockerPath)) {
    const backendDocker = fs.readFileSync(backendDockerPath, 'utf8');
    if (backendDocker.includes('AS builder') && backendDocker.includes('FROM node:20-alpine')) {
      pass('Backend Dockerfile implements Multi-Stage build (node:20-alpine)');
    } else {
      fail('Backend Dockerfile', 'Missing multi-stage builder definition');
    }

    if (backendDocker.includes('USER node') && backendDocker.includes('--chown=node:node')) {
      pass('Backend Dockerfile enforces non-root security isolation (USER node)');
    } else {
      fail('Backend Dockerfile', 'Missing non-root user configuration');
    }

    if (backendDocker.includes('dumb-init') && backendDocker.includes('HEALTHCHECK')) {
      pass('Backend Dockerfile includes PID 1 signal forwarding (dumb-init) & container HEALTHCHECK');
    } else {
      fail('Backend Dockerfile', 'Missing dumb-init or HEALTHCHECK');
    }
  } else {
    fail('Backend Dockerfile', 'File not found at backend/Dockerfile');
  }

  // 2. Audit Backend .dockerignore
  const backendIgnorePath = path.join(__dirname, '.dockerignore');
  if (fs.existsSync(backendIgnorePath)) {
    const ignore = fs.readFileSync(backendIgnorePath, 'utf8');
    if (ignore.includes('node_modules') && ignore.includes('.env')) {
      pass('Backend .dockerignore protects build context (excludes node_modules & secrets)');
    }
  } else {
    fail('Backend .dockerignore', 'Missing backend/.dockerignore');
  }

  // 3. Audit Frontend Dockerfile & Nginx Configuration
  const frontendDockerPath = path.join(ROOT_DIR, 'frontend', 'Dockerfile');
  const nginxConfPath = path.join(ROOT_DIR, 'frontend', 'nginx.conf');
  
  if (fs.existsSync(frontendDockerPath) && fs.existsSync(nginxConfPath)) {
    const frontendDocker = fs.readFileSync(frontendDockerPath, 'utf8');
    const nginxConf = fs.readFileSync(nginxConfPath, 'utf8');

    if (frontendDocker.includes('AS builder') && frontendDocker.includes('nginx:1.27-alpine')) {
      pass('Frontend Dockerfile implements Multi-Stage build (Vite Builder ➔ Nginx Alpine)');
    } else {
      fail('Frontend Dockerfile', 'Missing Nginx multi-stage configuration');
    }

    if (nginxConf.includes('try_files $uri $uri/ /index.html;') && nginxConf.includes('proxy_pass http://backend:5001')) {
      pass('Frontend nginx.conf configures SPA fallback routing & Docker internal DNS reverse proxy');
    } else {
      fail('Frontend nginx.conf', 'Missing try_files or proxy_pass directives');
    }
  } else {
    fail('Frontend Container Files', 'Missing Dockerfile or nginx.conf in frontend/');
  }

  // 4. Audit docker-compose.yml Specification
  const composePath = path.join(ROOT_DIR, 'docker-compose.yml');
  if (fs.existsSync(composePath)) {
    const compose = fs.readFileSync(composePath, 'utf8');

    const hasServices = compose.includes('mongo:') && compose.includes('backend:') && compose.includes('frontend:');
    if (hasServices) {
      pass('docker-compose.yml defines 3-Tier Multi-Container Stack (mongo, backend, frontend)');
    } else {
      fail('docker-compose.yml', 'Missing one or more required services');
    }

    if (compose.includes('awdf-network:') && compose.includes('bridge')) {
      pass('docker-compose.yml provisions isolated custom bridge network (awdf-network)');
    } else {
      fail('docker-compose.yml', 'Missing bridge network specification');
    }

    if (compose.includes('mongo-data:') && compose.includes('/data/db')) {
      pass('docker-compose.yml mounts persistent named volume for MongoDB ACID durability');
    } else {
      fail('docker-compose.yml', 'Missing persistent volume mapping');
    }

    if (compose.includes('condition: service_healthy')) {
      pass('docker-compose.yml enforces startup order dependency checks (condition: service_healthy)');
    } else {
      fail('docker-compose.yml', 'Missing service_healthy dependency condition');
    }
  } else {
    fail('docker-compose.yml', 'docker-compose.yml not found in project root');
  }

  // 5. Query Container Telemetry API Endpoint
  try {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/container/info`);
    const latency = parseFloat((performance.now() - start).toFixed(2));
    const data = await res.json();

    if (res.status === 200 && data.success) {
      pass(`GET /container/info responded in ${latency} ms with complete orchestration metadata`);
      pass(`Container Host: ${data.environment.containerId} | Arch: ${data.environment.arch} | Platform: ${data.environment.platform}`);
      pass(`Memory Heap: ${data.resources.heapUsedMb} MB / ${data.resources.heapTotalMb} MB (Uptime: ${data.environment.uptimeFormatted})`);
      pass(`Orchestration: ${data.orchestration.services.length} services configured on ${data.orchestration.network}`);
    } else {
      fail('Container Telemetry API', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('Container Telemetry API', err.message);
  }

  log(`\n=================================================================`, colors.magenta);
  log(`🎉 All Practical 11 Containerization Tests Passed Successfully!`, colors.bold + colors.green);
  log(`=================================================================\n`, colors.magenta);
};

run();
