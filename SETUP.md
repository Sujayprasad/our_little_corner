# Our Notes - Setup Guide

## Firebase Setup (For Cross-Device Sync)

To enable notes to sync across multiple devices/phones, you need to set up Firebase.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name: `our-little-corner`
4. Disable Google Analytics (not needed)
5. Click **Create project**

### Step 2: Add Web App

1. Click the **web icon** (`</>`) in the project overview
2. App nickname: `Our Notes`
3. Check "Also set up Firebase Hosting" (optional)
4. Click **Register app**
5. Copy the `firebaseConfig` object

### Step 3: Create Firestore Database

1. In the Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (allows read/write for now)
4. Select a location (us-central is fine)
5. Click **Enable**

### Step 4: Update the Code

In `app.js`, replace the `FIREBASE_CONFIG` placeholder with your keys:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 5: Deploy to GitHub Pages

```bash
# In your project folder
git add .
git commit -m "Add Firebase sync for cross-device data"
git push
```

Wait 30-60 seconds for GitHub Pages to rebuild, then refresh your site.

---

## Current Features

- **User switching**: PIN-based authentication (You: 1111, Her: 2222)
- **Notes visibility**: Both users can see each other's notes
- **Mobile responsive**: Works on phones
- **Data encryption**: Notes encrypted in local storage
- **Cross-device sync**: With Firebase, data syncs across all devices

---

## To-Do List

- [ ] Create Firebase project
- [ ] Add web app and copy config keys
- [ ] Create Firestore database in test mode
- [ ] Update `app.js` with Firebase config
- [ ] Commit and push to GitHub
- [ ] Test on multiple devices

---

## Security Notes

- Firebase config keys are **safe to commit** to public repos
- For production, update Firestore Rules to restrict access
- Current test mode allows anyone with the URL to read/write

### Future: Production Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if true; // Or add proper auth later
    }
  }
}
```
