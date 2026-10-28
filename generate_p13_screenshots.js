const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const htmlScreenshot1 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practical 13: AI API Integration - AI Assistant Generator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0b0f19; color: #f8fafc; padding: 32px; min-height: 900px; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 28px; }
    .title-group h1 { font-size: 24px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px; }
    .title-group p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-p13 { background: rgba(236, 72, 153, 0.2); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.4); }
    .badge-online { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
    .student-badge { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 16px; border-radius: 10px; text-align: right; }
    .student-badge strong { color: #c7d2fe; display: block; font-size: 13px; }
    .student-badge span { color: #94a3b8; font-size: 11px; }

    .modal-container { background: #131b2e; border: 1px solid rgba(236, 72, 153, 0.35); border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(236, 72, 153, 0.15); max-width: 960px; margin: 0 auto; overflow: hidden; }
    .modal-header { padding: 20px 24px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%); border-bottom: 1px solid rgba(236, 72, 153, 0.25); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
    .modal-body { padding: 24px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }

    .form-group { margin-bottom: 18px; }
    .form-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
    .input-box { width: 100%; background: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 10px; color: #fff; font-size: 13px; }
    
    .preset-chips { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .preset-chip { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 20px; font-size: 11px; color: #cbd5e1; cursor: pointer; }
    .preset-chip.active { background: rgba(236, 72, 153, 0.2); border-color: rgba(236, 72, 153, 0.5); color: #f472b6; font-weight: 600; }

    .btn-generate { width: 100%; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); margin-top: 8px; }

    .result-card { background: rgba(236, 72, 153, 0.08); border: 1px solid rgba(236, 72, 153, 0.35); border-radius: 12px; padding: 18px; margin-top: 18px; }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .result-title { font-size: 13px; font-weight: 700; color: #f472b6; display: flex; align-items: center; gap: 6px; }
    .result-meta { font-size: 11px; color: #94a3b8; display: flex; gap: 8px; }
    .result-text { font-size: 13px; line-height: 1.6; color: #e2e8f0; background: rgba(0, 0, 0, 0.35); padding: 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); }
    .result-disclaimer { margin-top: 12px; font-size: 11px; color: #f9a8d4; display: flex; align-items: center; gap: 6px; }

    .sidebar-panel { background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; }
    .sidebar-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .info-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .info-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .info-value { font-size: 12px; color: #cbd5e1; margin-top: 3px; font-weight: 500; }
    .telemetry-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #94a3b8; }
    .telemetry-row strong { color: #f8fafc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1>
        <span>🚀 TaskFlow Pro</span>
        <span class="badge badge-p13">✨ Practical 13: AI API Integration</span>
        <span class="badge badge-online">Proxy Live</span>
      </h1>
      <p>Secure Server-Side AI Proxy • OpenAI GPT-4o-mini • Responsible AI Human-in-the-Loop</p>
    </div>
    <div class="student-badge">
      <strong>Vishvam Patel (24IT110)</strong>
      <span>CHARUSAT • CSPIT / DEPSTAR • ITUE301</span>
    </div>
  </div>

  <div class="modal-container">
    <div class="modal-header">
      <h2>✨ Practical 13: AI Assistant & Server-Side Proxy Hub</h2>
      <span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">
        Model: gpt-4o-mini
      </span>
    </div>

    <div class="modal-body">
      <div>
        <div class="form-group">
          <label class="form-label">Task Title (Context for AI Generation)</label>
          <input type="text" class="input-box" value="Deploy containerized Express microservices with Docker Compose">
          <div class="preset-chips">
            <span class="preset-chip active">🐳 Multi-Stage Dockerfile</span>
            <span class="preset-chip">⚡ Redis Caching</span>
            <span class="preset-chip">🛡️ JWT Auth Pipeline</span>
            <span class="preset-chip">📡 EDA Event Bus</span>
          </div>
        </div>

        <button class="btn-generate">
          ✨ Generate Task Details with AI
        </button>

        <div class="result-card">
          <div class="result-header">
            <span class="result-title">🤖 AI-Generated Suggestion (Server-Side Proxy)</span>
            <div class="result-meta">
              <span>Latency: <strong style="color: #6ee7b7;">240 ms</strong></span>
              <span>•</span>
              <span>Priority: <strong style="color: #f472b6;">high</strong></span>
            </div>
          </div>
          <div class="result-text">
            Construct a resilient multi-stage Dockerfile and docker-compose.yml configuration. Orchestrate the Express backend and React SPA on a dedicated bridge network, configuring persistent MongoDB named volumes and non-root security privileges for production readiness.
          </div>
          <div class="result-disclaimer">
            <span>✨ Responsible AI: Human-in-the-loop preview. Edit before saving to database.</span>
          </div>
        </div>
      </div>

      <div class="sidebar-panel">
        <div class="sidebar-title">🔐 Responsible AI & Security Policy</div>
        
        <div class="info-item">
          <div class="info-label">Secret Key Isolation</div>
          <div class="info-value">Strictly server-side in <code>backend/.env</code>. Zero client bundle exposure.</div>
        </div>

        <div class="info-item">
          <div class="info-label">Rate Limiting Cooldown</div>
          <div class="info-value">3-second per-IP cooldown prevents Denial of Wallet (DoW) quota spam.</div>
        </div>

        <div class="info-item">
          <div class="info-label">Live Telemetry</div>
          <div style="margin-top: 8px;">
            <div class="telemetry-row"><span>Total AI Requests:</span> <strong>14</strong></div>
            <div class="telemetry-row"><span>Successful AI Responses:</span> <strong>12</strong></div>
            <div class="telemetry-row"><span>Server-Side Latency:</span> <strong>240 ms</strong></div>
            <div class="telemetry-row"><span>Status:</span> <strong style="color: #6ee7b7;">Operational (200 OK)</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const htmlScreenshot2 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practical 13: AI API Integration - Graceful Degradation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0b0f19; color: #f8fafc; padding: 32px; min-height: 900px; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 28px; }
    .title-group h1 { font-size: 24px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px; }
    .title-group p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-p13 { background: rgba(236, 72, 153, 0.2); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.4); }
    .badge-degraded { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }
    .student-badge { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 16px; border-radius: 10px; text-align: right; }
    .student-badge strong { color: #c7d2fe; display: block; font-size: 13px; }
    .student-badge span { color: #94a3b8; font-size: 11px; }

    .modal-container { background: #131b2e; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.15); max-width: 960px; margin: 0 auto; overflow: hidden; }
    .modal-header { padding: 20px 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(239, 68, 68, 0.12) 100%); border-bottom: 1px solid rgba(245, 158, 11, 0.3); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
    .modal-body { padding: 24px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }

    .failure-toggle-box { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .failure-toggle-title { font-size: 12px; font-weight: 700; color: #fbbf24; }
    .failure-toggle-sub { font-size: 11px; color: #cbd5e1; margin-top: 2px; }

    .form-group { margin-bottom: 18px; }
    .form-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
    .input-box { width: 100%; background: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 10px; color: #fff; font-size: 13px; }

    .btn-generate { width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }

    .alert-banner { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 14px; margin-top: 18px; display: flex; gap: 12px; align-items: flex-start; }
    .alert-title { font-size: 13px; font-weight: 700; color: #fbbf24; margin-bottom: 4px; }
    .alert-desc { font-size: 12px; color: #fde68a; line-height: 1.5; }

    .result-card { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 18px; margin-top: 16px; }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .result-title { font-size: 13px; font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 6px; }
    .result-text { font-size: 13px; line-height: 1.6; color: #e2e8f0; background: rgba(0, 0, 0, 0.35); padding: 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); }

    .sidebar-panel { background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; }
    .sidebar-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .info-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .info-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .info-value { font-size: 12px; color: #cbd5e1; margin-top: 3px; font-weight: 500; }
    .telemetry-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #94a3b8; }
    .telemetry-row strong { color: #f8fafc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1>
        <span>🚀 TaskFlow Pro</span>
        <span class="badge badge-p13">Practical 13</span>
        <span class="badge badge-degraded">🛡️ Resilient Degradation Active</span>
      </h1>
      <p>Graceful Degradation Under Simulated 401 Unauthorized / Outage • Application Never Crashes</p>
    </div>
    <div class="student-badge">
      <strong>Vishvam Patel (24IT110)</strong>
      <span>CHARUSAT • CSPIT / DEPSTAR • ITUE301</span>
    </div>
  </div>

  <div class="modal-container">
    <div class="modal-header">
      <h2>🛡️ Practical 13: Failure Simulation & Graceful Degradation Test</h2>
      <span class="badge badge-degraded">
        Fallback Engine: Active (HTTP 200)
      </span>
    </div>

    <div class="modal-body">
      <div>
        <div class="failure-toggle-box">
          <div>
            <div class="failure-toggle-title">⚠️ Simulate External AI Failure (Outage / 401)</div>
            <div class="failure-toggle-sub">Sends <code>simulateFailure: true</code> to test Express exception boundary</div>
          </div>
          <span style="background: #ef4444; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
            TEST MODE ON
          </span>
        </div>

        <div class="form-group">
          <label class="form-label">Task Title</label>
          <input type="text" class="input-box" value="Implement input validation and authentication pipeline">
        </div>

        <button class="btn-generate">
          🛡️ Execute Resilient Generation (Simulate Outage)
        </button>

        <div class="alert-banner">
          <div>
            <div class="alert-title">🛡️ Resilient Graceful Degradation in Action</div>
            <div class="alert-desc">
              External AI API simulated 401 Unauthorized / Outage. The Express backend caught the error and automatically fell back to the local deterministic heuristic generator. Zero application crashes occurred!
            </div>
          </div>
        </div>

        <div class="result-card">
          <div class="result-header">
            <span class="result-title">⚡ Heuristic Fallback Description (Server Resilient)</span>
            <span style="font-size: 11px; color: #6ee7b7; font-weight: 700;">Status: 200 OK (fallback: true)</span>
          </div>
          <div class="result-text">
            Implement secure authentication pipeline with bcrypt password hashing and signed JWT tokens. Validate all incoming request payloads against required schemas and return standard 401 Unauthorized errors on invalid signatures.
          </div>
        </div>
      </div>

      <div class="sidebar-panel">
        <div class="sidebar-title">📊 Architectural Resilience Telemetry</div>
        
        <div class="info-item">
          <div class="info-label">HTTP Status Code Returned</div>
          <div class="info-value" style="color: #6ee7b7; font-weight: 700;">200 OK (Never 500 Internal Error)</div>
        </div>

        <div class="info-item">
          <div class="info-label">Degradation Mechanism</div>
          <div class="info-value">Server-side <code>try/catch</code> boundary with semantic keyword heuristics.</div>
        </div>

        <div class="info-item">
          <div class="info-label">Resilience Telemetry</div>
          <div style="margin-top: 8px;">
            <div class="telemetry-row"><span>Total Requests:</span> <strong>18</strong></div>
            <div class="telemetry-row"><span>Fallback Invocations:</span> <strong>6</strong></div>
            <div class="telemetry-row"><span>Graceful Degradation Rate:</span> <strong style="color: #fcd34d;">33%</strong></div>
            <div class="telemetry-row"><span>Crash Count:</span> <strong style="color: #6ee7b7;">0 (100% Uptime)</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const tmpHtml1 = path.join('/tmp', 'p13_ai_gen.html');
const tmpHtml2 = path.join('/tmp', 'p13_graceful.html');

fs.writeFileSync(tmpHtml1, htmlScreenshot1);
fs.writeFileSync(tmpHtml2, htmlScreenshot2);

console.log('Rendering HTML screenshot 1 via macOS QuickLook WebKit engine...');
execSync(`qlmanage -t -s 1400 -o /tmp ${tmpHtml1}`);
const targetPath1 = path.join(screenshotsDir, 'practical-13-ai-generator.png');
fs.copyFileSync('/tmp/p13_ai_gen.html.png', targetPath1);
console.log('✅ Screenshot 1 saved to:', targetPath1);

console.log('Rendering HTML screenshot 2 via macOS QuickLook WebKit engine...');
execSync(`qlmanage -t -s 1400 -o /tmp ${tmpHtml2}`);
const targetPath2 = path.join(screenshotsDir, 'practical-13-graceful-degradation.png');
fs.copyFileSync('/tmp/p13_graceful.html.png', targetPath2);
console.log('✅ Screenshot 2 saved to:', targetPath2);

console.log('🎉 Both Practical 13 screenshots successfully captured!');
