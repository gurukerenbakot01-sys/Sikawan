import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data folder and data files exist
function initDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(TEACHERS_FILE)) {
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

initDataFiles();

function readTeachers() {
  try {
    initDataFiles();
    const content = fs.readFileSync(TEACHERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeTeachers(teachers: any[]) {
  try {
    initDataFiles();
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write teachers file', e);
  }
}

function readSubmissions() {
  try {
    initDataFiles();
    const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeSubmissions(submissions: any[]) {
  try {
    initDataFiles();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write submissions file', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Sikawan SDN Babelan Kota 01', timestamp: new Date().toISOString() });
  });

  // Get Teachers
  app.get('/api/teachers', (req, res) => {
    const teachers = readTeachers();
    res.json(teachers);
  });

  // Update Teachers (Bulk or Single array)
  app.post('/api/teachers', (req, res) => {
    const data = req.body;
    if (Array.isArray(data)) {
      writeTeachers(data);
      return res.json({ success: true, count: data.length, teachers: data });
    }
    return res.status(400).json({ error: 'Body must be an array of teachers' });
  });

  // Clear all teachers
  app.post('/api/teachers/clear', (req, res) => {
    writeTeachers([]);
    res.json({ success: true, count: 0, teachers: [] });
  });

  // Get Submissions
  app.get('/api/submissions', (req, res) => {
    const submissions = readSubmissions();
    res.json(submissions);
  });

  // Update Submissions
  app.post('/api/submissions', (req, res) => {
    const data = req.body;
    if (Array.isArray(data)) {
      writeSubmissions(data);
      return res.json({ success: true, count: data.length });
    }
    return res.status(400).json({ error: 'Body must be an array of submissions' });
  });

  // Clear all submissions
  app.post('/api/submissions/clear', (req, res) => {
    writeSubmissions([]);
    res.json({ success: true, count: 0 });
  });

  // Clear ALL database completely
  app.post('/api/clear-all', (req, res) => {
    writeTeachers([]);
    writeSubmissions([]);
    res.json({ success: true, message: 'Semua database guru dan laporan telah dikosongkan.' });
  });

  // --- VITE / STATIC MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIKAWAN Server running on port ${PORT}`);
  });
}

startServer();
