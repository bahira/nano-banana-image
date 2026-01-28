const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Assuming run from headless-notion dir
const DB_FILE = path.join(__dirname, 'notes.json');

// Load DB
let db = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : { notes: [] };

// Function to add note
function addNote(content, tags = [], source = 'clawd') {
  const note = {
    id: crypto.randomUUID(),
    content,
    tags,
    source,
    timestamp: new Date().toISOString()
  };
  db.notes.push(note);
  return note;
}

// Import from memory
function importMemory() {
  const memoryDir = path.join(__dirname, '..', 'memory');
  if (!fs.existsSync(memoryDir)) {
    console.log('Memory dir not found');
    return;
  }
  const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md')).sort();
  for (const file of files) {
    const content = fs.readFileSync(path.join(memoryDir, file), 'utf8');
    // Split by lines or sections, but simple, add the whole file as one note per day?
    // Or parse lines.
    // For simplicity, add the file content as a note, tagged with date.
    const date = file.replace('.md', '');
    addNote(content, ['memory', date], 'clawd');
  }
  // Save DB
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log('Imported memory notes');
}

importMemory();