/**
 * Practical 12: CI/CD Pipeline Automated Verification Suite
 * Student Name: Vishvam Patel
 * Student ID: 24IT110
 * Course: Advanced Web Development Frameworks (ITUE301)
 * Institution: CSPIT / DEPSTAR, CHARUSAT
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

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

async function runVerification() {
  console.log('\n================================================================');
  console.log('🚀 CHARUSAT ITUE301 - Practical 12: CI/CD Pipeline Verification');
  console.log('👤 Student: Vishvam Patel (24IT110)');
  console.log('================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const backendDir = __dirname;

  // 1. Check Jest Test Suite File
  const testFilePath = path.join(backendDir, 'tests', 'tasks.test.js');
  const testFileExists = fs.existsSync(testFilePath);
  assertCheck('Automated Jest & Supertest file exists (backend/tests/tasks.test.js)', testFileExists);

  if (testFileExists) {
    const testContent = fs.readFileSync(testFilePath, 'utf8');
    assertCheck('Test suite includes GET /tasks returns 200 (Lab Sheet Step 2)', testContent.includes("GET /tasks returns 200"));
    assertCheck('Test suite includes post-lab second endpoint test (GET /api)', testContent.includes("GET /api"));
    assertCheck('Test suite includes container telemetry endpoint test (GET /container/info)', testContent.includes("GET /container/info"));
    assertCheck('Test suite supports deliberate failure simulation (CI_SIMULATE_FAILURE)', testContent.includes("CI_SIMULATE_FAILURE"));
  }

  // 2. Check package.json scripts
  const packageJsonPath = path.join(backendDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assertCheck('package.json contains "npm test" running Jest', pkg.scripts && pkg.scripts.test && pkg.scripts.test.includes('jest'));
  assertCheck('package.json contains "npm run lint" code quality gate', pkg.scripts && pkg.scripts.lint);
  assertCheck('package.json devDependencies include jest and supertest', pkg.devDependencies && pkg.devDependencies.jest && pkg.devDependencies.supertest);

  // 3. Check GitHub Actions Workflows
  const workflowPath = path.join(rootDir, '.github', 'workflows', 'ci.yml');
  const prWorkflowPath = path.join(rootDir, '.github', 'workflows', 'pr-ci.yml');
  const workflowExists = fs.existsSync(workflowPath);
  const prWorkflowExists = fs.existsSync(prWorkflowPath);

  assertCheck('GitHub Actions workflow file exists (.github/workflows/ci.yml)', workflowExists);
  assertCheck('Pull Request CI workflow exists (.github/workflows/pr-ci.yml - Supplementary 2)', prWorkflowExists);

  if (workflowExists) {
    const ciContent = fs.readFileSync(workflowPath, 'utf8');
    assertCheck('Workflow triggers on push to main branch', ciContent.includes('push:') && ciContent.includes('branches: [main]'));
    assertCheck('Workflow contains checkout and setup-node actions', ciContent.includes('actions/checkout@v4') && ciContent.includes('actions/setup-node@v4'));
    assertCheck('Workflow defines dependency installation step (npm ci / npm install)', ciContent.includes('npm ci') || ciContent.includes('npm install'));
    assertCheck('Workflow defines test execution step (npm test)', ciContent.includes('npm test'));
    assertCheck('Workflow defines code quality lint step (npm run lint)', ciContent.includes('npm run lint'));
  }

  // 4. Run Normal Passing Test Suite (Green Checkmark)
  console.log('\n  🧪 Executing Automated Test Suite (Passing Run - Step 6)...');
  try {
    const testOutput = execSync('npm test 2>&1', { cwd: backendDir, encoding: 'utf8' });
    assertCheck('Normal Jest test suite passes with 0 failures (Green Checkmark ✅)', testOutput.includes('PASS tests/tasks.test.js') || testOutput.includes('passed'));
  } catch (err) {
    assertCheck('Normal Jest test suite passes with 0 failures (Green Checkmark ✅)', false, err.message);
  }

  // 5. Run Deliberately Broken Test Suite (Red X)
  console.log('\n  💥 Executing Deliberate Broken Test Suite (Failing Run - Step 5)...');
  try {
    execSync('npm run test:broken', { cwd: backendDir, stdio: 'pipe' });
    assertCheck('Deliberately broken test exits with error (Red X ❌)', false, 'Expected test to fail but it passed');
  } catch (err) {
    // Expected to throw an error with exit code 1
    const output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    assertCheck('Deliberately broken test exits with error code 1 (Red X ❌)', err.status === 1 && (output.includes('FAIL') || output.includes('Expected: 500')));
  }

  // 6. Test Live Express Telemetry Endpoints
  console.log('\n  🌐 Testing Live Backend Telemetry Endpoints (/ci/info & /ci/run)...');
  try {
    const infoRes = await makeRequest('GET', '/ci/info');
    assertCheck('GET /ci/info returns 200 with pipeline metadata and status badge', infoRes.status === 200 && infoRes.body.success && infoRes.body.statusBadge);

    const runRes = await makeRequest('POST', '/ci/run', { broken: false });
    assertCheck('POST /ci/run returns 200 with passing run telemetry (success conclusion)', runRes.status === 200 && runRes.body.run?.conclusion === 'success');

    const brokenRes = await makeRequest('POST', '/ci/run', { broken: true });
    assertCheck('POST /ci/run (broken: true) returns failing run telemetry (failure conclusion)', brokenRes.status === 200 && brokenRes.body.run?.conclusion === 'failure');
  } catch (err) {
    assertCheck('Live backend endpoints responsive', false, err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULT: ${passed}/${total} Practical 12 Checks Passed (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 Practical 12 (CI/CD Pipeline with GitHub Actions) is 100% Complete & Verified!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} checks failed.`);
    process.exit(1);
  }
}

runVerification();
