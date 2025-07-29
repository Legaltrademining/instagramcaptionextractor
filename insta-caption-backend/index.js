const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const extractInstagramData = async (url) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new", // Use "true" for older Puppeteer versions
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    await page.goto(url, { waitUntil: "networkidle2" });

    const result = await page.evaluate(() => {
      let caption = null;
      let image = null;

      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson) {
        try {
          const metadata = JSON.parse(ldJson.innerText);
          caption = metadata.caption || metadata.articleBody || null;
          image = metadata.image || null;
        } catch (e) {}
      }

      if (!caption) {
        const captionElem = document.querySelector("meta[property='og:description']");
        if (captionElem) {
          caption = captionElem.getAttribute("content");
        }
      }

      if (!image) {
        const imgElem = document.querySelector("meta[property='og:image']");
        if (imgElem) {
          image = imgElem.getAttribute("content");
        }
      }

      return { caption, image };
    });

    return result;
  } catch (err) {
    console.error("❌ Puppeteer error:", err.message);
    throw new Error("Could not extract Instagram data.");
  } finally {
    if (browser) await browser.close();
  }
};

app.get("/api/extract", async (req, res) => {
  const postUrl = req.query.url;
  const validPath = /instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+/i;

  if (!postUrl || !validPath.test(postUrl)) {
    return res.status(400).json({
      error: "Invalid Instagram URL. Must be a post, reel, or IGTV link.",
    });
  }

  try {
    const result = await extractInstagramData(postUrl);
    if (!result.caption && !result.image) {
      return res.status(500).json({ error: "Could not extract any content." });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
