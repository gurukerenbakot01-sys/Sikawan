import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { PERMANENT_DEFAULT_TEACHERS } from './src/data/defaultTeachers';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data folder and default data files exist
function initDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(TEACHERS_FILE)) {
      fs.writeFileSync(TEACHERS_FILE, JSON.stringify(PERMANENT_DEFAULT_TEACHERS, null, 2), 'utf-8');
    } else {
      // If teachers file is empty or corrupted, populate default
      try {
        const content = fs.readFileSync(TEACHERS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          fs.writeFileSync(TEACHERS_FILE, JSON.stringify(PERMANENT_DEFAULT_TEACHERS, null, 2), 'utf-8');
        }
      } catch (e) {
        fs.writeFileSync(TEACHERS_FILE, JSON.stringify(PERMANENT_DEFAULT_TEACHERS, null, 2), 'utf-8');
      }
    }

    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing data files:', err);
  }
}

initDataFiles();

function readTeachers() {
  try {
    initDataFiles();
    const content = fs.readFileSync(TEACHERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Fallback to permanent default teachers
    writeTeachers(PERMANENT_DEFAULT_TEACHERS);
    return PERMANENT_DEFAULT_TEACHERS;
  } catch (e) {
    return PERMANENT_DEFAULT_TEACHERS;
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

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Sikawan SDN Babelan Kota 01',
      teachersCount: readTeachers().length,
      submissionsCount: readSubmissions().length,
      timestamp: new Date().toISOString()
    });
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

  // Reset to default 39 permanent teachers
  app.post('/api/teachers/reset-baku', (req, res) => {
    writeTeachers(PERMANENT_DEFAULT_TEACHERS);
    res.json({ success: true, count: PERMANENT_DEFAULT_TEACHERS.length, teachers: PERMANENT_DEFAULT_TEACHERS });
  });

  // Delete Teacher
  app.delete('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    const current = readTeachers();
    const filtered = current.filter((t: any) => t.id !== id);
    writeTeachers(filtered);
    res.json({ success: true, count: filtered.length, teachers: filtered });
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

  // Save / Add Submissions (supports array or single submission object)
  app.post('/api/submissions', (req, res) => {
    const data = req.body;
    if (Array.isArray(data)) {
      writeSubmissions(data);
      return res.json({ success: true, count: data.length, submissions: data });
    } else if (data && typeof data === 'object' && data.id) {
      // Single submission added
      const current = readSubmissions();
      const existingIdx = current.findIndex((s: any) => s.id === data.id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = data;
      } else {
        updated = [data, ...current];
      }
      writeSubmissions(updated);
      return res.json({ success: true, count: updated.length, submissions: updated });
    }
    return res.status(400).json({ error: 'Body must be an array or a submission object' });
  });

  // Update submission status
  app.patch('/api/submissions/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const current = readSubmissions();
    const updated = current.map((s: any) => (s.id === id ? { ...s, status } : s));
    writeSubmissions(updated);
    res.json({ success: true, count: updated.length, submissions: updated });
  });

  // Delete single submission
  app.delete('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const current = readSubmissions();
    const updated = current.filter((s: any) => s.id !== id);
    writeSubmissions(updated);
    res.json({ success: true, count: updated.length, submissions: updated });
  });

  // Clear all submissions
  app.post('/api/submissions/clear', (req, res) => {
    writeSubmissions([]);
    res.json({ success: true, count: 0, submissions: [] });
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
