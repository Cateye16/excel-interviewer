require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Loaded Gemini key:", GEMINI_API_KEY ? "Yes" : "No");

// Optional: backend endpoint (not mandatory for PoC)
app.get("/", (req, res) => {
  res.send("Your backend is running ✅");
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
