const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const session = require("express-session");

const app = express();
const PORT = 3000;

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Middleware for session
app.use(cors());
app.use(bodyParser.json());
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));

// Google Drive API
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// Store the saved content in memory (this will be uploaded to Google Drive)
let selections = [];

// Route to start the OAuth process
app.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  res.redirect(url);
});

// Route to handle OAuth callback and set the tokens
app.get("/auth/google/callback", (req, res) => {
  const code = req.query.code;

  oAuth2Client.getToken(code, (err, tokens) => {
    if (err) return res.status(400).json({ error: "Failed to get tokens" });
    
    oAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens; // Store the tokens in session

    res.redirect("/dashboard");
  });
});

// Route to save content
app.post("/save-selection", (req, res) => {
  const { content, title, date } = req.body;

  if (!content || !title || !date) {
    return res.status(400).json({ error: "Content, title, and date are required" });
  }

  // Add new selection
  selections.push({ content, title, date });

  // Save content to Google Drive as a JSON file
  if (req.session.tokens) {
    oAuth2Client.setCredentials(req.session.tokens);
    
    const fileMetadata = {
      name: `${title}.json`,
      mimeType: "application/json",
    };

    const media = {
      mimeType: "application/json",
      body: JSON.stringify({ content, title, date }),
    };

    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) {
          return res.status(500).json({ error: "Failed to save content to Google Drive" });
        }
        res.json({ message: "Selection saved successfully to Google Drive", fileId: file.data.id });
      }
    );
  } else {
    res.status(401).json({ error: "User is not authenticated" });
  }
});

// Route to fetch all saved selections (from Google Drive)
app.get("/selections", (req, res) => {
  if (req.session.tokens) {
    oAuth2Client.setCredentials(req.session.tokens);

    // List files from Google Drive (you could add filtering logic here)
    drive.files.list(
      {
        q: "mimeType='application/json'",
        fields: "files(id, name)",
      },
      (err, response) => {
        if (err) {
          return res.status(500).json({ error: "Failed to fetch files from Google Drive" });
        }

        // Fetch file metadata (you could fetch content here as well)
        res.json(response.data.files);
      }
    );
  } else {
    res.status(401).json({ error: "User is not authenticated" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
