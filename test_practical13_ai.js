/**
 * Practical 13: AI API Integration Automated Verification Suite
 * Student Name: Vishvam Patel
 * Student ID: 24IT110
 * Course: Advanced Web Development Frameworks (ITUE301)
 * Institution: CSPIT / DEPSTAR, CHARUSAT
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

let passed = 0;
let total = 0;

function assertCheck(title, condition, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [CHECK ${total}] PASS: ${title}`);
  } else {
    console.error(`  ❌ [CHECK ${total}] FAIL: ${title}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

function makeRequest(method, endpoint, payload = null) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('\n================================================================');
  console.log('🤖 CHARUSAT ITUE301 - Practical 13: AI API Integration Verification');
  console.log('👤 Student: Vishvam Patel (24IT110)');
  console.log('================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const backendDir = __dirname;

  // 1. Dependency & Secret Configuration Checks
  const packageJsonPath = path.join(backendDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assertCheck('Backend package.json contains "openai" dependency', pkg.dependencies && pkg.dependencies.openai);

  const envExamplePath = path.join(backendDir, '.env.example');
  const envExampleExists = fs.existsSync(envExamplePath);
  assertCheck('Backend .env.example exists', envExampleExists);
  if (envExampleExists) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    assertCheck('.env.example documents OPENAI_API_KEY', envContent.includes('OPENAI_API_KEY'));
    assertCheck('.env.example documents GEMINI_API_KEY', envContent.includes('GEMINI_API_KEY'));
    assertCheck('.env.example documents AI_MODEL and AI_RATE_LIMIT_SECONDS', envContent.includes('AI_MODEL') && envContent.includes('AI_RATE_LIMIT_SECONDS'));
  }

  // 2. Architecture Code Structure Checks
  const controllerPath = path.join(backendDir, 'src', 'controllers', 'aiController.js');
  const routesPath = path.join(backendDir, 'src', 'routes', 'aiRoutes.js');
  assertCheck('AI Controller exists (src/controllers/aiController.js)', fs.existsSync(controllerPath));
  assertCheck('AI Routes exists (src/routes/aiRoutes.js)', fs.existsSync(routesPath));

  if (fs.existsSync(controllerPath)) {
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    assertCheck('Controller implements rate limiting cooldown', controllerContent.includes('COOLDOWN_MS') || controllerContent.includes('RATE_LIMIT'));
    assertCheck('Controller implements graceful fallback heuristic generator', controllerContent.includes('generateFallbackDescription'));
    assertCheck('Controller implements simulated failure capability', controllerContent.includes('simulateFailure'));
    assertCheck('Controller attaches responsible AI disclaimer', controllerContent.includes('disclaimer') || controllerContent.includes('AI-generated content'));
  }

  // 3. Live Endpoint Verification: GET /api/ai/status
  try {
    const statusRes = await makeRequest('GET', '/api/ai/status');
    assertCheck('GET /api/ai/status returns HTTP 200 OK', statusRes.status === 200);
    assertCheck('AI Status reports operational status and practical metadata', statusRes.body.success && statusRes.body.practical && statusRes.body.practical.includes('Practical 13'));
    assertCheck('Status endpoint surfaces responsible AI guidelines', statusRes.body.responsibleAi && statusRes.body.responsibleAi.humanInTheLoop);
  } catch (err) {
    assertCheck('GET /api/ai/status endpoint reachable', false, err.message);
  }

  // 4. Live Endpoint Verification: POST /api/ai/generate-description (Normal Generation)
  // Wait 3.5 seconds to guarantee rate limit window is clear before starting
  await sleep(3500);

  try {
    const genRes = await makeRequest('POST', '/api/ai/generate-description', {
      title: 'Implement database connection pooling and query optimization',
      priority: 'high'
    });
    assertCheck('POST /api/ai/generate-description returns HTTP 200 OK', genRes.status === 200);
    assertCheck('AI Generation returns non-empty description', genRes.body.data && typeof genRes.body.data.description === 'string' && genRes.body.data.description.length > 20);
    assertCheck('AI Generation returns suggestedPriority and responseTimeMs', genRes.body.data && genRes.body.data.suggestedPriority && genRes.body.data.responseTimeMs !== undefined);
    assertCheck('AI Generation returns responsible AI disclaimer', genRes.body.data && typeof genRes.body.data.disclaimer === 'string');
  } catch (err) {
    assertCheck('POST /api/ai/generate-description reachable', false, err.message);
  }

  // 5. Rate Limiting Test (Immediate second call triggers HTTP 429)
  try {
    const rateLimitRes = await makeRequest('POST', '/api/ai/generate-description', {
      title: 'Spam rapid test title'
    });
    assertCheck('Rapid successive request triggers HTTP 429 Too Many Requests', rateLimitRes.status === 429);
    assertCheck('HTTP 429 response includes cooldown guidance', rateLimitRes.body.error && rateLimitRes.body.retryAfterSec !== undefined);
  } catch (err) {
    assertCheck('Rate limiting check completed', false, err.message);
  }

  // 6. Graceful Degradation / Failure Simulation Test (simulateFailure: true)
  // Wait cooldown to clear 429
  console.log('  ⏳ Waiting 3.5s for rate limit cooldown before testing simulated failure...');
  await sleep(3500);

  try {
    const failRes = await makeRequest('POST', '/api/ai/generate-description', {
      title: 'Refactor authentication state with Redux Toolkit',
      simulateFailure: true
    });
    assertCheck('Simulated failure returns HTTP 200 (Graceful Degradation, never 500)', failRes.status === 200);
    assertCheck('Simulated failure payload marks fallback: true', failRes.body.data && failRes.body.data.fallback === true);
    assertCheck('Simulated failure provides resilient heuristic description', failRes.body.data && typeof failRes.body.data.description === 'string' && failRes.body.data.description.length > 20);
  } catch (err) {
    assertCheck('Graceful degradation check completed', false, err.message);
  }

  // 7. Input Validation: Title empty returns HTTP 400
  await sleep(3500);
  try {
    const emptyRes = await makeRequest('POST', '/api/ai/generate-description', {
      title: '   '
    });
    assertCheck('Empty title payload returns HTTP 400 Bad Request', emptyRes.status === 400);
  } catch (err) {
    assertCheck('Empty title check completed', false, err.message);
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`📊 Practical 13 Verification Results: ${passed} / ${total} Checks Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('----------------------------------------------------------------\n');

  if (passed === total) {
    console.log('🎉 ALL PRACTICAL 13 REQUIREMENTS SUCCESSFULLY VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME CHECKS FAILED. Please review the output above.\n');
    process.exit(1);
  }
}

runVerification();
