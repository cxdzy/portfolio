const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, initDatabase } = require('./db');

// Load .env if dotenv is available (optional dev dependency)
try { require('dotenv').config(); } catch {}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Image upload setup with multer
const multer = require('multer');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
});

const baseUrl = () => process.env.BASE_URL || `http://localhost:${PORT}`;

// ==================== STATUSES ====================

app.get('/api/statuses', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM statuses ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/statuses', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });

  let conn;
  try {
    conn = await pool.getConnection();
    const id = Date.now();
    await conn.query('INSERT INTO statuses (id, content, date) VALUES (?, ?, ?)', [id, content.trim(), 'Just now']);
    res.status(201).json({ id, content: content.trim(), date: 'Just now' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/statuses/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM statuses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== POSTS ====================

app.get('/api/posts', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM posts ORDER BY id DESC');
    
    const posts = [];
    for (const row of rows) {
      const images = await conn.query('SELECT image_url FROM post_images WHERE post_id = ?', [row.id]);
      let content = row.content;
      try { content = JSON.parse(content); } catch { /* keep as string */ }
      posts.push({
        id: row.id,
        title: row.title,
        content,
        date: row.date,
        fullDate: row.full_date,
        readTime: row.read_time,
        imageUrls: images.length > 0 ? images.map(img => img.image_url) : null
      });
    }
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/posts', upload.array('images', 10), async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  let conn;
  try {
    conn = await pool.getConnection();
    const id = Date.now();
    const today = new Date();
    const date = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = today.toISOString().split('T')[0];
    
    // Store content as JSON array (paragraphs split by newline)
    const contentArray = content.split('\n').filter(p => p.trim() !== '');
    
    await conn.query(
      'INSERT INTO posts (id, title, content, date, full_date, read_time) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title.trim(), JSON.stringify(contentArray), date, fullDate, '1 min']
    );

    // Save uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `${baseUrl()}/uploads/${file.filename}`;
        await conn.query('INSERT INTO post_images (post_id, image_url) VALUES (?, ?)', [id, imageUrl]);
        imageUrls.push(imageUrl);
      }
    }

    res.status(201).json({
      id, title: title.trim(), content: contentArray, date, fullDate: fullDate,
      readTime: '1 min', imageUrls: imageUrls.length > 0 ? imageUrls : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Get associated images to delete files
    const images = await conn.query('SELECT image_url FROM post_images WHERE post_id = ?', [req.params.id]);
    for (const img of images) {
      const filename = img.image_url.split('/uploads/').pop();
      if (filename) {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }
    await conn.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== PROJECTS ====================

app.get('/api/projects', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM projects ORDER BY id DESC');
    
    const projects = [];
    for (const row of rows) {
      const images = await conn.query('SELECT image_url FROM project_images WHERE project_id = ?', [row.id]);
      let tags = [];
      try { tags = JSON.parse(row.tags); } catch { /* keep empty */ }
      projects.push({
        id: row.id,
        name: row.name,
        desc: row.description,
        tags,
        imageUrls: images.length > 0 ? images.map(img => img.image_url) : null
      });
    }
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/projects', upload.array('images', 10), async (req, res) => {
  const { name, desc, tags } = req.body;
  if (!name || !desc) return res.status(400).json({ error: 'Name and description are required' });

  let conn;
  try {
    conn = await pool.getConnection();
    const id = Date.now();
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

    await conn.query(
      'INSERT INTO projects (id, name, description, tags) VALUES (?, ?, ?, ?)',
      [id, name.trim(), desc.trim(), JSON.stringify(tagArray)]
    );

    // Save uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `${baseUrl()}/uploads/${file.filename}`;
        await conn.query('INSERT INTO project_images (project_id, image_url) VALUES (?, ?)', [id, imageUrl]);
        imageUrls.push(imageUrl);
      }
    }

    res.status(201).json({
      id, name: name.trim(), desc: desc.trim(), tags: tagArray,
      imageUrls: imageUrls.length > 0 ? imageUrls : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const images = await conn.query('SELECT image_url FROM project_images WHERE project_id = ?', [req.params.id]);
    for (const img of images) {
      const filename = img.image_url.split('/uploads/').pop();
      if (filename) {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }
    await conn.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Portfolio API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
