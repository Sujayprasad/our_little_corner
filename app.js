// App State
let currentUser = null;
let notes = [];
let selectedNote = null;
let refreshInterval = null;
let useApi = false;

// User configuration
const USERS = {
    'you': { name: 'You', pin: '1111', icon: '👤' },
    'her': { name: 'Her', pin: '2222', icon: '💕' }
};

// API URL - Replace with your ngrok URL when running server
// Example: 'https://abc123.ngrok.io'
const API_URL = ' https://fossilizable-cherelle-unswaddling.ngrok-free.dev'; // Leave empty to use localStorage only

// Simple encryption/decryption (XOR cipher with base64)
const APP_KEY = 'our_little_corner_secret_key_2024';

function encrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ APP_KEY.charCodeAt(i % APP_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
}

function decrypt(encoded) {
    try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ APP_KEY.charCodeAt(i % APP_KEY.length));
        }
        return result;
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}

// Check if API is available
async function checkApi() {
    if (!API_URL) return false;
    try {
        const response = await fetch(`${API_URL}/notes`, { method: 'GET' });
        return response.ok;
    } catch {
        return false;
    }
}

// Initialize app
async function init() {
    useApi = await checkApi();
    loadNotes();
    setupEventListeners();
    showUserModal();

    // Poll for updates every 3 seconds if using API
    if (useApi) {
        refreshInterval = setInterval(async () => {
            try {
                const response = await fetch(`${API_URL}/notes`);
                const newNotes = await response.json();
                if (JSON.stringify(newNotes) !== JSON.stringify(notes)) {
                    notes = newNotes;
                    if (currentUser) renderNotes();
                }
            } catch (e) {
                console.error('Poll error:', e);
            }
        }, 3000);
    }
}

// Load notes from API or localStorage
function loadNotes() {
    if (useApi) {
        fetch(`${API_URL}/notes`)
            .then(res => res.json())
            .then(data => {
                notes = data;
                saveToLocalStorage();
            })
            .catch(() => loadFromLocalStorage());
    } else {
        loadFromLocalStorage();
    }
}

// Load from localStorage fallback
function loadFromLocalStorage() {
    const stored = localStorage.getItem('our-notes');
    if (stored) {
        const decrypted = decrypt(stored);
        notes = decrypted ? JSON.parse(decrypted) : [];
    } else {
        notes = [];
    }
}

// Save to localStorage
function saveToLocalStorage() {
    const encrypted = encrypt(JSON.stringify(notes));
    localStorage.setItem('our-notes', encrypted);
}

// Save note to API
async function saveNoteToApi(note) {
    if (!API_URL) return;
    try {
        await fetch(`${API_URL}/notes/${note.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });
    } catch (error) {
        console.error('API save error:', error);
    }
}

// Add note to API
async function addNoteToApi(note) {
    if (!API_URL) return;
    try {
        await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });
    } catch (error) {
        console.error('API add error:', error);
    }
}

// Show user selection modal
function showUserModal() {
    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('pin-entry').classList.add('hidden');
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-error').textContent = '';
}

// Setup event listeners
function setupEventListeners() {
    // User buttons
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userKey = btn.dataset.user;
            document.getElementById('pin-entry').classList.remove('hidden');
            document.getElementById('pin-input').focus();

            document.getElementById('verify-pin').onclick = () => verifyPin(userKey);
            document.getElementById('pin-input').onkeypress = (e) => {
                if (e.key === 'Enter') verifyPin(userKey);
            };
        });
    });

    // Switch user button
    document.getElementById('switch-user').addEventListener('click', showUserModal);

    // Add note
    document.getElementById('add-note').addEventListener('click', addNote);

    // Add comment
    document.getElementById('add-comment').addEventListener('click', addComment);
    document.getElementById('comment-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addComment();
    });

    // Acknowledge note
    document.getElementById('acknowledge-btn').addEventListener('click', acknowledgeNote);

    // Close note modal
    document.getElementById('close-note').addEventListener('click', () => {
        document.getElementById('note-modal').classList.add('hidden');
        selectedNote = null;
    });
}

// Verify PIN and log in user
function verifyPin(userKey) {
    const input = document.getElementById('pin-input').value;
    const user = USERS[userKey];

    if (input === user.pin) {
        currentUser = { key: userKey, ...user };
        document.getElementById('user-modal').classList.add('hidden');
        document.getElementById('current-user').textContent = `${user.icon} ${user.name}`;
        renderNotes();
    } else {
        document.getElementById('pin-error').textContent = 'Incorrect PIN';
    }
}

// Add new note
async function addNote() {
    const content = document.getElementById('note-content').value.trim();
    if (!content) return;

    const note = {
        id: Date.now(),
        userId: currentUser.key,
        content: content,
        acknowledged: false,
        comments: [],
        createdAt: new Date().toISOString()
    };

    if (useApi) {
        await addNoteToApi(note);
        notes.unshift(note);
    } else {
        notes.unshift(note);
        saveToLocalStorage();
    }

    document.getElementById('note-content').value = '';
    renderNotes();
}

// Render notes list
function renderNotes() {
    const container = document.getElementById('notes-container');
    const userNotes = notes.filter(n => n.userId === currentUser.key);
    const otherNotes = notes.filter(n => n.userId !== currentUser.key);

    if (notes.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No notes yet. Create your first note!</p>';
        return;
    }

    // Render notes from current user
    const myNotesHTML = currentUser.key === 'you'
        ? userNotes.map(note => renderNoteCard(note, 'Your Note')).join('')
        : userNotes.map(note => renderNoteCard(note, '👤 You')).join('');

    // Render notes from other user (her)
    const herNotesHTML = currentUser.key === 'you'
        ? otherNotes.map(note => renderNoteCard(note, '💕 Her')).join('')
        : otherNotes.map(note => renderNoteCard(note, '👤 Her')).join('');

    container.innerHTML = `
        ${userNotes.length > 0 ? '<h3 style="margin: 15px 0 10px; color: #667eea;">My Notes</h3>' : ''}
        ${myNotesHTML}
        ${otherNotes.length > 0 ? '<h3 style="margin: 15px 0 10px; color: #e91e63;">Notes from Her</h3>' : ''}
        ${herNotesHTML}
    `;

    // Add click handlers
    container.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            openNote(id);
        });
    });
}

// Open note detail
function openNote(noteId) {
    selectedNote = notes.find(n => n.id === noteId);
    if (!selectedNote) return;

    document.getElementById('note-text').textContent = selectedNote.content;
    document.getElementById('note-date').textContent = 'Created: ' + new Date(selectedNote.createdAt).toLocaleString();
    document.getElementById('note-status').textContent = selectedNote.acknowledged ? 'Status: Read ✓' : 'Status: Unread';
    document.getElementById('note-status').className = 'status ' + (selectedNote.acknowledged ? 'read' : 'unread');

    renderComments();

    document.getElementById('acknowledge-btn').textContent = selectedNote.acknowledged ? 'Already Read ✓' : 'Mark as Read';
    document.getElementById('acknowledge-btn').disabled = selectedNote.acknowledged;

    document.getElementById('note-modal').classList.remove('hidden');
}

// Render comments
function renderComments() {
    const list = document.getElementById('comments-list');
    if (selectedNote.comments.length === 0) {
        list.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No comments yet</p>';
        return;
    }

    list.innerHTML = selectedNote.comments.map(c => `
        <div class="comment">
            <div>${c.text}</div>
            <div class="comment-date">${new Date(c.createdAt).toLocaleString()}</div>
        </div>
    `).join('');
}

// Add comment to note
async function addComment() {
    const text = document.getElementById('comment-input').value.trim();
    if (!text || !selectedNote) return;

    selectedNote.comments.push({
        text: text,
        createdAt: new Date().toISOString()
    });

    if (useApi) {
        await saveNoteToApi(selectedNote);
    } else {
        saveToLocalStorage();
    }
    document.getElementById('comment-input').value = '';
    renderComments();
    renderNotes();
}

// Acknowledge note
async function acknowledgeNote() {
    if (!selectedNote) return;

    selectedNote.acknowledged = true;

    if (useApi) {
        await saveNoteToApi(selectedNote);
    } else {
        saveToLocalStorage();
    }

    document.getElementById('note-status').textContent = 'Status: Read ✓';
    document.getElementById('note-status').className = 'status read';
    document.getElementById('acknowledge-btn').textContent = 'Already Read ✓';
    document.getElementById('acknowledge-btn').disabled = true;

    renderNotes();
}

// Render a single note card
function renderNoteCard(note, authorLabel) {
    const isFromHer = (currentUser.key === 'you' && note.userId === 'her') ||
                      (currentUser.key === 'her' && note.userId === 'you');
    return `
        <div class="note-card ${note.acknowledged ? 'acknowledged' : ''} ${isFromHer ? 'from-her' : ''}" data-id="${note.id}">
            <div class="author-label">${authorLabel}</div>
            <div class="preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
            <div class="meta">
                <span>${new Date(note.createdAt).toLocaleDateString()}</span>
                <span class="status-badge ${note.acknowledged ? 'read' : 'unread'}">
                    ${note.acknowledged ? '✓ Read' : '○ Unread'}
                </span>
            </div>
        </div>
    `;
}

// Start the app
init();
