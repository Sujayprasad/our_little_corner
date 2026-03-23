// App State
let currentUser = null;
let notes = [];
let selectedNote = null;

// User configuration
const USERS = {
    'you': { name: 'You', pin: '1111', icon: '👤' },
    'her': { name: 'Her', pin: '2222', icon: '💕' }
};

// Initialize app
function init() {
    loadNotes();
    setupEventListeners();
    showUserModal();
}

// Load notes from localStorage
function loadNotes() {
    const stored = localStorage.getItem('our-notes');
    notes = stored ? JSON.parse(stored) : [];
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('our-notes', JSON.stringify(notes));
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
function addNote() {
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

    notes.unshift(note);
    saveNotes();

    document.getElementById('note-content').value = '';
    renderNotes();
}

// Render notes list
function renderNotes() {
    const container = document.getElementById('notes-container');
    const userNotes = notes.filter(n => n.userId === currentUser.key);

    if (userNotes.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No notes yet. Create your first note!</p>';
        return;
    }

    container.innerHTML = userNotes.map(note => `
        <div class="note-card ${note.acknowledged ? 'acknowledged' : ''}" data-id="${note.id}">
            <div class="preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
            <div class="meta">
                <span>${new Date(note.createdAt).toLocaleDateString()}</span>
                <span class="status-badge ${note.acknowledged ? 'read' : 'unread'}">
                    ${note.acknowledged ? '✓ Read' : '○ Unread'}
                </span>
            </div>
        </div>
    `).join('');

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
function addComment() {
    const text = document.getElementById('comment-input').value.trim();
    if (!text || !selectedNote) return;

    selectedNote.comments.push({
        text: text,
        createdAt: new Date().toISOString()
    });

    saveNotes();
    document.getElementById('comment-input').value = '';
    renderComments();

    // Re-render the notes list to update preview
    renderNotes();
}

// Acknowledge note
function acknowledgeNote() {
    if (!selectedNote) return;

    selectedNote.acknowledged = true;
    saveNotes();

    document.getElementById('note-status').textContent = 'Status: Read ✓';
    document.getElementById('note-status').className = 'status read';
    document.getElementById('acknowledge-btn').textContent = 'Already Read ✓';
    document.getElementById('acknowledge-btn').disabled = true;

    renderNotes();
}

// Start the app
init();
