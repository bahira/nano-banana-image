const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const DB_FILE = process.env.NODE_ENV === 'production' ? path.join('/tmp', 'notes.json') : path.join(__dirname, 'notes.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ notes: [] }, null, 2));
}

// Load DB
let db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Save DB
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Headless Notion API is running', endpoints: ['/notes', '/notes/search', '/notes/:id'] });
});

// Add note
app.post('/notes', (req, res) => {
  const { content, tags = [], source = 'unknown' } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const note = {
    id: crypto.randomUUID(),
    content,
    tags,
    source,
    timestamp: new Date().toISOString()
  };
  db.notes.push(note);
  saveDB();
  res.status(201).json(note);
});

// Search notes
app.get('/notes/search', (req, res) => {
  const query = req.query.q || '';
  const tag = req.query.tag;
  let results = db.notes.filter(note => {
    const matchesQuery = query ? note.content.toLowerCase().includes(query.toLowerCase()) : true;
    const matchesTag = tag ? note.tags.includes(tag) : true;
    return matchesQuery && matchesTag;
  });
  res.json(results);
});

// Get all notes
app.get('/notes', (req, res) => {
  res.json(db.notes);
});

// Get note by id
app.get('/notes/:id', (req, res) => {
  const note = db.notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Update note
app.put('/notes/:id', (req, res) => {
  const noteIndex = db.notes.findIndex(n => n.id === req.params.id);
  if (noteIndex === -1) return res.status(404).json({ error: 'Note not found' });
  const { content, tags } = req.body;
  if (content !== undefined) db.notes[noteIndex].content = content;
  if (tags !== undefined) db.notes[noteIndex].tags = tags;
  saveDB();
  res.json(db.notes[noteIndex]);
});

// Delete note
app.delete('/notes/:id', (req, res) => {
  const noteIndex = db.notes.findIndex(n => n.id === req.params.id);
  if (noteIndex === -1) return res.status(404).json({ error: 'Note not found' });
  db.notes.splice(noteIndex, 1);
  saveDB();
  res.status(204).send();
});

module.exports = app;