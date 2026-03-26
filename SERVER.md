# Flask Server Setup Guide

## For Cross-Device Sync Using Your PC as Server

### Step 1: Install Python (if not already installed)

Download from [python.org](https://www.python.org/downloads/)

### Step 2: Install Dependencies

Open Command Prompt or Git Bash in the project folder:

```bash
pip install flask flask-cors
```

### Step 3: Run the Server

```bash
python server.py
```

You should see:
```
Server running on http://localhost:5000
```

### Step 4: Expose with ngrok (for remote access)

1. Download ngrok from [ngrok.com](https://ngrok.com/download)
2. Sign up for free account
3. Run:
```bash
ngrok http 5000
```

4. Copy the HTTPS URL (looks like `https://abc123.ngrok.io`)

### Step 5: Update app.js

Replace the `API_URL` in `app.js` with your ngrok URL:

```javascript
const API_URL = 'https://your-ngrok-url.ngrok.io';
```

### Step 6: Commit and push

```bash
git add .
git commit -m "Add Python server for sync"
git push
```

---

## Important Notes

- **Your PC must stay ON** for others to access notes
- **ngrok URL changes** each time you restart ngrok (free tier)
- Update `API_URL` in `app.js` each time ngrok URL changes

---

## To Stop Server

Press `Ctrl+C` in the terminal running the server.

---

## Data Storage

Notes are stored in `notes_data.json` in the project folder.
