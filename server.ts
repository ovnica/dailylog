import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'shared_entries.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read entries
function readEntriesFromFile(): any[] | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading shared_entries.json:', err);
  }
  return null;
}

// Helper to write entries
function writeEntriesToFile(entries: any[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing shared_entries.json:', err);
    return false;
  }
}

// GET API endpoint to fetch shared activities
app.get('/api/entries', (_req, res) => {
  const entries = readEntriesFromFile();
  res.json({
    success: true,
    entries: entries || [],
    hasData: entries !== null && entries.length > 0,
    timestamp: new Date().toISOString(),
  });
});

// POST API endpoint to save shared activities
app.post('/api/entries', (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) {
    return res.status(400).json({ success: false, error: 'Expected entries array' });
  }

  const success = writeEntriesToFile(entries);
  if (success) {
    return res.json({ success: true, count: entries.length, timestamp: new Date().toISOString() });
  } else {
    return res.status(500).json({ success: false, error: 'Failed to write to storage' });
  }
});

async function setupApp() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Lazuardi Activity Log server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
