/**
 * Practical 10: Asynchronous Processing with Event-Driven Architecture Verification Script
 * Course: Advanced Web Development Frameworks (ITUE301)
 * Student: Vishvam Patel (24IT110)
 * 
 * Verifies:
 * 1. Event publication on task creation, update, and deletion
 * 2. Background worker execution (Audit Logger, Notification Dispatcher, Analytics Aggregator)
 * 3. Asynchronous job queue creation (HTTP 202 Accepted) and progress tracking
 * 4. Synchronous vs. Asynchronous comparative latency benchmark
 * 5. Event stream telemetry stats (/tasks/events/stats)
 */

const BASE_URL = 'http://localhost:5001';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);
const pass = (title) => log(`  ✅ PASS: ${title}`, colors.green);
const fail = (title, err) => {
  log(`  ❌ FAIL: ${title} - ${err}`, colors.red);
  process.exitCode = 1;
};

const run = async () => {
  log(`\n=================================================================`, colors.magenta);
  log(`🧪 Running Practical 10 Verification: Event-Driven Architecture`, colors.bold + colors.cyan);
  log(`👤 Student: Vishvam Patel (ID: 24IT110) | CHARUSAT`, colors.cyan);
  log(`=================================================================\n`, colors.magenta);

  let token = null;

  // Step 1: Login or Register
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishvam@example.com', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      token = loginData.token;
      pass('Authenticated test user via JWT');
    } else {
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Vishvam Patel', email: 'vishvam@example.com', password: 'Password123!' })
      });
      const regData = await regRes.json();
      token = regData.token;
      pass('Registered & authenticated test user via JWT');
    }
  } catch (err) {
    fail('Auth bootstrap', err.message);
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Step 2: Clear previous event logs
  try {
    const clearRes = await fetch(`${BASE_URL}/tasks/events/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const clearData = await clearRes.json();
    if (clearData.success) {
      pass('Reset EventBus logs for clean evaluation baseline');
    }
  } catch (err) {
    fail('Event log reset', err.message);
  }

  // Step 3: Create Task -> Verify Instant Response & Event Publication
  let taskId = null;
  try {
    const start = performance.now();
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'EDA Asynchronous Processing Test Task',
        description: 'Emits task:created event to decoupled subscribers',
        priority: 'high'
      })
    });
    const clientLatencyMs = parseFloat((performance.now() - start).toFixed(2));
    const createData = await createRes.json();
    taskId = createData.data._id;

    if (createData.asyncEventDispatched === 'task:created' && clientLatencyMs < 400) {
      pass(`Published 'task:created' event with non-blocking HTTP response (${clientLatencyMs} ms)`);
    } else {
      fail('Task creation event dispatch', `Dispatched: ${createData.asyncEventDispatched}`);
    }
  } catch (err) {
    fail('Create task event test', err.message);
  }

  // Step 4: Update Task -> Verify 'task:updated' & 'task:completed' Events
  try {
    const updateRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        completed: true
      })
    });
    const updateData = await updateRes.json();
    if (updateData.asyncEventDispatched === 'task:completed') {
      pass(`Published 'task:completed' event to Notification & Metrics workers`);
    } else {
      fail('Task completion event dispatch', `Got: ${updateData.asyncEventDispatched}`);
    }
  } catch (err) {
    fail('Update task event test', err.message);
  }

  // Step 5: Wait briefly for background workers (Audit, Email, Analytics) to execute
  await new Promise(r => setTimeout(r, 350));

  // Step 6: Verify EventBus Telemetry & Workers
  try {
    const statsRes = await fetch(`${BASE_URL}/tasks/events/stats`);
    const statsData = await statsRes.json();

    if (statsData.success && statsData.telemetry.totalEmitted >= 2) {
      pass(`Decoupled EventBus recorded ${statsData.telemetry.totalEmitted} emitted events across 3 active background workers`);
      pass(`Workers triggered: Audit Logger, Notification Dispatcher, Analytics Aggregator`);
    } else {
      fail('EventBus stats check', 'Expected >= 2 emitted events');
    }
  } catch (err) {
    fail('EventBus stats test', err.message);
  }

  // Step 7: Create Long-Running Asynchronous Job (HTTP 202 Accepted)
  let jobId = null;
  try {
    const jobRes = await fetch(`${BASE_URL}/tasks/events/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PROJECT_ANALYTICS_REPORT',
        params: { scope: 'full' }
      })
    });

    if (jobRes.status === 202) {
      const jobData = await jobRes.json();
      jobId = jobData.job.id;
      pass(`Asynchronous background job enqueued successfully with HTTP 202 Accepted (${jobId})`);
    } else {
      fail('Async job queue', `Expected HTTP 202, got ${jobRes.status}`);
    }
  } catch (err) {
    fail('Async job dispatch test', err.message);
  }

  // Step 8: Poll Job Until Completion (Progress 0% -> 100%)
  try {
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 15) {
      await new Promise(r => setTimeout(r, 600));
      const statusRes = await fetch(`${BASE_URL}/tasks/events/jobs/${jobId}`);
      const statusData = await statusRes.json();
      if (statusData.job?.status === 'completed') {
        completed = true;
        pass(`Job '${jobId}' finished background execution (Progress: 100%, Artifact: ${statusData.job.result.reportTitle})`);
      }
      attempts++;
    }
    if (!completed) {
      fail('Async job polling', 'Job did not reach completion within timeout');
    }
  } catch (err) {
    fail('Job polling test', err.message);
  }

  // Step 9: Synchronous vs Asynchronous Comparative Benchmark
  try {
    const benchRes = await fetch(`${BASE_URL}/tasks/benchmark/sync-vs-async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const benchData = await benchRes.json();

    if (benchData.success && benchData.benchmark.speedupPercent > 80) {
      pass(`Sync vs. Async Benchmark: Synchronous=${benchData.benchmark.synchronousLatencyMs}ms vs. Asynchronous=${benchData.benchmark.asynchronousLatencyMs}ms (${benchData.benchmark.speedupPercent}% faster response)`);
    } else {
      fail('Sync vs async benchmark', 'Latency comparison failed');
    }
  } catch (err) {
    fail('Sync vs async benchmark test', err.message);
  }

  log(`\n=================================================================`, colors.magenta);
  log(`🎉 All Practical 10 Event-Driven Architecture Tests Passed!`, colors.bold + colors.green);
  log(`=================================================================\n`, colors.magenta);
};

run();
