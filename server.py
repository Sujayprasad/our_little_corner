from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from browser

DATA_FILE = 'notes_data.json'

# Load notes from file
def load_notes():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Save notes to file
def save_notes(notes):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(notes, f, indent=2, ensure_ascii=False)

# Get all notes
@app.route('/notes', methods=['GET'])
def get_notes():
    notes = load_notes()
    return jsonify(notes)

# Add a new note
@app.route('/notes', methods=['POST'])
def add_note():
    notes = load_notes()
    new_note = request.json
    new_note['id'] = datetime.now().timestamp() * 1000  # Unique ID
    notes.insert(0, new_note)
    save_notes(notes)
    return jsonify(new_note), 201

# Update a note
@app.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    notes = load_notes()
    note_id = int(note_id)

    for note in notes:
        if note['id'] == note_id:
            note.update(request.json)
            save_notes(notes)
            return jsonify(note)

    return jsonify({'error': 'Note not found'}), 404

# Delete a note
@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    notes = load_notes()
    note_id = int(note_id)

    notes = [n for n in notes if n['id'] != note_id]
    save_notes(notes)
    return jsonify({'success': True})

if __name__ == '__main__':
    # Create empty data file if it doesn't exist
    if not os.path.exists(DATA_FILE):
        save_notes([])

    print("Server running on http://localhost:5000")
    print("Press Ctrl+C to stop")
    app.run(debug=True, port=5000)
