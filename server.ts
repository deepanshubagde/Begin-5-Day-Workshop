import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure data storage directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Initialize submissions file if not exists
if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Config file initialization
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(
      {
        googleSheetWebhookUrl:
          process.env.GOOGLE_SHEET_WEBHOOK_URL ||
          'https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec',
        syncToGoogleForm: false,
      },
      null,
      2
    ),
    'utf8'
  );
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets from public directly before Vite SPA handling
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dedicated header image endpoint - streams the custom uploaded image or default
app.get('/api/header-image', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const candidates = ['custom-header.png', 'custom-header.jpg', 'custom-header.jpeg', 'custom-header.webp'];
  for (const f of candidates) {
    const p = path.join(__dirname, 'public', f);
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }
  const def = path.join(__dirname, 'public', 'form-header.png');
  if (fs.existsSync(def)) {
    return res.sendFile(def);
  }
  res.status(404).send('Not found');
});

// Get current sheet and app config
app.get('/api/config', (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const data = JSON.parse(raw);
    // Check if custom header exists on disk
    const hasCustom = ['custom-header.png', 'custom-header.jpg', 'custom-header.jpeg', 'custom-header.webp'].some(f =>
      fs.existsSync(path.join(__dirname, 'public', f))
    );
    if (hasCustom && (!data.headerImageUrl || data.headerImageUrl.startsWith('/custom-header'))) {
      data.headerImageUrl = `/api/header-image?v=${Date.now()}`;
    }
    res.json(data);
  } catch {
    res.json({
      googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || '',
      syncToGoogleForm: false,
      headerImageUrl: '',
    });
  }
});

// Update sheet config
app.post('/api/config', (req, res) => {
  try {
    const { googleSheetWebhookUrl, syncToGoogleForm, headerImageUrl } = req.body;
    let existing: any = {};
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {}

    const config = {
      ...existing,
      googleSheetWebhookUrl: googleSheetWebhookUrl !== undefined ? googleSheetWebhookUrl : (existing.googleSheetWebhookUrl || ''),
      syncToGoogleForm: syncToGoogleForm !== undefined ? Boolean(syncToGoogleForm) : Boolean(existing.syncToGoogleForm),
      headerImageUrl: headerImageUrl !== undefined ? headerImageUrl : (existing.headerImageUrl || ''),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload custom header image
app.post('/api/upload-header', (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    let savedImageUrl = '';

    // If base64 data url, write to public directory
    if (imageData.startsWith('data:image/')) {
      const match = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1].replace('svg+xml', 'svg');
        const buffer = Buffer.from(match[2], 'base64');
        const filename = `custom-header.${ext}`;
        const filePath = path.join(__dirname, 'public', filename);
        fs.writeFileSync(filePath, buffer);
        savedImageUrl = `/api/header-image?v=${Date.now()}`;
      } else {
        savedImageUrl = imageData;
      }
    } else {
      savedImageUrl = imageData;
    }

    // Save in config
    let existing: any = {};
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {}

    const config = {
      ...existing,
      headerImageUrl: savedImageUrl,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

    res.json({ success: true, headerImageUrl: savedImageUrl });
  } catch (err: any) {
    console.error('Header image upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset header image to default
app.post('/api/reset-header', (req, res) => {
  try {
    let existing: any = {};
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {}

    const config = {
      ...existing,
      headerImageUrl: '',
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

    // Also delete any custom header file in public if exists
    const candidates = ['custom-header.png', 'custom-header.jpg', 'custom-header.jpeg', 'custom-header.webp'];
    for (const f of candidates) {
      const p = path.join(__dirname, 'public', f);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch {}
      }
    }

    res.json({ success: true, headerImageUrl: '' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    const data = JSON.parse(raw);
    res.json({ count: data.length, submissions: data });
  } catch {
    res.json({ count: 0, submissions: [] });
  }
});

// Submit response
app.post('/api/submit', async (req, res) => {
  try {
    const body = req.body;
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    const record = {
      id: submissionId,
      submittedAt: timestamp,
      fullName: body.fullName || '',
      contactNumber: body.contactNumber || '',
      city: body.city || '',
      achieveSoonest: Array.isArray(body.achieveSoonest) ? body.achieveSoonest : [],
      otherAchieve: body.otherAchieve || '',
      challenges: body.challenges || '',
      expectations: body.expectations || '',
      additionalInfo: body.additionalInfo || '',
      meta: {
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || '',
      },
    };

    // Save locally
    let submissions: any[] = [];
    try {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
      submissions = JSON.parse(raw);
    } catch {
      submissions = [];
    }
    submissions.unshift(record);
    // Keep last 500
    if (submissions.length > 500) {
      submissions = submissions.slice(0, 500);
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');

    // Attempt sync to Google Sheet webhook if configured
    let sheetSynced = false;
    let sheetError = null;

    let targetUrl = '';
    try {
      const cfgRaw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const cfg = JSON.parse(cfgRaw);
      targetUrl = cfg.googleSheetWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL || '';
    } catch {
      targetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || '';
    }

    if (targetUrl && targetUrl.startsWith('https://script.google.com')) {
      try {
        const payload = {
          timestamp: new Date().toLocaleString(),
          fullName: record.fullName,
          contactNumber: record.contactNumber,
          city: record.city,
          achieveSoonest: record.achieveSoonest.join(', ') + (record.otherAchieve ? ` (Other: ${record.otherAchieve})` : ''),
          challenges: record.challenges,
          expectations: record.expectations,
          additionalInfo: record.additionalInfo,
          submissionId: record.id,
        };

        const sheetResp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        if (sheetResp.ok || sheetResp.status === 200 || sheetResp.status === 302) {
          sheetSynced = true;
        } else {
          sheetError = `HTTP ${sheetResp.status}`;
        }
      } catch (err: any) {
        sheetError = err.message || 'Webhook unreachable';
      }
    }

    res.json({
      success: true,
      submissionId,
      sheetSynced,
      sheetError,
      message: 'Your reflection has been submitted successfully!',
      record,
    });
  } catch (err: any) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
