# Headless Notion

A simple headless note-taking system mimicking Notion databases. Stores notes in a JSON file, searchable via API.

## Features
- Add notes with content, tags, source
- Search notes by content or tag
- CRUD operations via REST API
- No folders, organization via tags

## API Endpoints
- POST /notes: Add note (body: {content, tags[], source})
- GET /notes/search?q=query&tag=tag: Search notes
- GET /notes: Get all notes
- GET /notes/:id: Get note by id
- PUT /notes/:id: Update note (body: {content, tags})
- DELETE /notes/:id: Delete note

## Running
node server.js

Starts on port 3000.

## Auto Store from Clawd Interactions
To auto store, run the import script periodically:
node import-memory.js

This reads memory/YYYY-MM-DD.md and adds new notes tagged with 'clawd' and 'memory'.

For texts, assume external input or hook.