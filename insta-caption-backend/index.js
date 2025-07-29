const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/extract", async (req, res) => {
  const postUrl = req.query.url;

  if (!postUrl || !postUrl.includes("instagram.com/p/")) {
    return res.status(400).json({ error: "Invalid Instagram post URL." });
  }

  try {
    const { data: html } = await axios.get(postUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);
    const jsonText = $('script[type="application/ld+json"]').html();

    if (!jsonText) {
      return res.status(500).json({ error: "Could not find Instagram metadata." });
    }

    const metadata = JSON.parse(jsonText);

    const caption = metadata.caption || metadata.articleBody || null;
    const image = metadata.image || null;

    res.json({ caption, image });
  } catch (error) {
    res.status(500).json({ error: "Failed to extract data. Post may be private or removed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
