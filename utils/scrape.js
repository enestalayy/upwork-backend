const puppeteer = require("puppeteer");

function parsePostedDate(dateString) {
  console.log(
    "process.env.PUPPETEER_EXECUTABLE_PATH",
    process.env.PUPPETEER_EXECUTABLE_PATH
  );
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
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-gpu",
      // "--headless",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-zygote",
    ],
    headless: false,
    executablePath:
      process.env.NODE_ENV === "development"
        ? "/usr/bin/google-chrome-stable"
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  await page.goto(url);

  // Sayfa içeriğini konsola yazdırma (hata ayıklama için)
  const pageContent = await page.content();

  const jobs = await page.evaluate(() => {
    const articles = document.querySelectorAll("section article");

    return Array.from(articles).map((article) => {
      const job = {
        title: article.querySelector("h2.job-tile-title a")?.innerText,
        link: article.querySelector("h2.job-tile-title a")?.href,
        postedDate: article.querySelector("small span:nth-child(2)")?.innerText,
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

  await browser.close();

  return processedJobs;
}

module.exports = scrapeJobList;
