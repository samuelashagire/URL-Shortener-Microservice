require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();
const urlDatabase = {};
let urlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3001;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// URL Shortener Microservice endpoint
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Check if the URL is valid
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  // Extract hostname to verify it exists
  const hostname = new URL(originalUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Store the URL and return the short URL
    const shortUrl = urlCounter++;
    urlDatabase[shortUrl] = originalUrl;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});