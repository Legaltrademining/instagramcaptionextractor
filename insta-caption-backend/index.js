const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 🧭 Emulate mobile browser
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15A372 Safari/604.1"
  );

  // 📐 Viewport and language settings
  await page.setViewport({ width: 375, height: 812 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

  // 🖼 Navigate to Instagram post
  await page.goto("https://www.instagram.com/p/POST_ID", {
    waitUntil: "networkidle2"
  });

  // 🔍 Extract caption and image
  const result = await page.evaluate(() => {
    let caption = null;
    let image = null;

    // Try newer selector first
    const captionElem = document.querySelector("div[data-testid='media-caption']");
    if (captionElem) caption = captionElem.innerText;

    // Fallback to standard image element
    const imgElem = document.querySelector("article img");
    if (imgElem) image = imgElem.src;

    return { caption, image };
  });

  console.log(result);

  await browser.close();
})();
