const puppeteer = require("puppeteer");
require("dotenv").config();

let browserInstance = null;

const launchBrowser = async () => {
  browserInstance = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
};

function parsePostedDate(dateString) {
  const now = new Date();
  if (dateString.toLowerCase() === "yesterday") {
    dateString = "1 day ago";
  }
  const parts = dateString.toLowerCase().match(/(\d+)\s*(\w+)/);
  if (!parts) return null;

  const [, amount, unit] = parts;
  const value = parseInt(amount, 10);

  const unitMultipliers = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  };

  const multiplier = unitMultipliers[unit.replace(/s$/, "")] || 0;
  return multiplier ? new Date(now - value * multiplier) : null;
}

async function scrapeJobList(url) {
  try {
    if (!browserInstance) {
      await launchBrowser();
    }
    const page = await browserInstance.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 1080, height: 1024 });
    page.setDefaultTimeout(120000);

    // Sayfa içeriğini konsola yazdırma (hata ayıklama için)
    const pageContent = await page.content();

    const jobs = await page.evaluate(() => {
      const articles = document.querySelectorAll("section article");

      return Array.from(articles).map((article) => {
        const job = {
          title: article.querySelector("h2.job-tile-title a")?.innerText,
          link: article.querySelector("h2.job-tile-title a")?.href,
          postedDate: article.querySelector("small span:nth-child(2)")
            ?.innerText,
          clientLocation: article.querySelector('li[data-test="location"]')
            ?.innerText,
          paymentVerified: article.querySelector(
            'li[data-test="payment-verified"]'
          )?.innerText,
          budget: article.querySelector(
            'li[data-test="is-fixed-price"] strong:nth-child(2)'
          )?.innerText,
          description: article.querySelector(
            'div[data-test="UpCLineClamp JobDescription"] p'
          )?.innerText,
          skills: Array.from(
            article.querySelectorAll(".air3-token-container .air3-token span")
          ).map((skill) => skill.innerText),
        };

        return job;
      });
    });

    console.log("Total jobs scraped:", jobs.length);

    // postedDate'i parsePostedDate fonksiyonu ile işleme
    const processedJobs = jobs.map((job) => {
      job.postedDate = parsePostedDate(job.postedDate);
      return job; // Her iş objesini geri döndür
    });

    console.log("Processed jobs:", processedJobs);

    await page.close();

    return processedJobs;
  } catch (e) {
    console.error(`Error scraping job list: ${e}`);
    throw e;
  }
}

module.exports = scrapeJobList;
