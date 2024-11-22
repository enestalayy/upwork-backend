const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

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
    week: 7 * 24 * 60 * 60 * 1000,
  };

  const multiplier = unitMultipliers[unit.replace(/s$/, "")] || 0;
  return multiplier ? new Date(now - value * multiplier) : null;
}

let browser;
let page;

// Browser'ı başlatma fonksiyonu
async function initBrowser() {
  // console.log("Browser initializing...");
  if (!browser) {
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? "/usr/bin/google-chrome-stable"
          : puppeteer.executablePath(),
    });
  }
}

// Oturum kontrolü fonksiyonu
async function isLoggedIn() {
  // console.log("Oturum çerezi kontrolü başlatılıyor...", page);

  if (!page) {
    page = await browser.newPage();
  }

  const cookies = await page.cookies();
  const accessTokenCookie = cookies.find(
    (cookie) => cookie.name === "master_access_token"
  );

  if (accessTokenCookie) {
    // console.log("Oturum açık, access token:", accessTokenCookie.value);
    return true;
  } else {
    // console.log("Access token bulunamadı, kullanıcı giriş yapmamış.");
    return false;
  }
}

// Giriş yapma fonksiyonu
async function login() {
  // console.log("Login Function started");

  if (!page.url().includes("login")) {
    // console.log("Moving to login page to log in");
    await page.goto("https://www.upwork.com/ab/account-security/login", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  await page.locator("#login_username").fill(process.env.UPWORK_EMAIL);
  // console.log("email filled");

  await page.keyboard.press("Enter");

  await new Promise((resolve) => setTimeout(resolve, 10000));
  await page.type('input[id="login_password"]', process.env.UPWORK_PASS);
  // console.log("password filled");
  await page.keyboard.press("Enter");

  await page.click("button[id='login_control_continue']");
  // console.log("logging in...");

  await new Promise((resolve) => setTimeout(resolve, 10000));
  // console.log("Logged in");
}

async function scrapeJobList(url) {
  if (!browser) {
    await initBrowser();
  }
  console.log("page: " + page);
  if (!page) {
    page = await browser.newPage();
  }

  if (!(await isLoggedIn())) {
    await login();
  }
  // console.log("Moving to filter url...");
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  // console.log("Filter url page loaded");

  const jobs = await page.evaluate(() => {
    const articles = document.querySelectorAll("section article");

    return Array.from(articles).map((article) => {
      const job = {
        title: article.querySelector("h2.job-tile-title a")?.innerText,
        link: article.querySelector("h2.job-tile-title a")?.href,
        postedDate: article.querySelector("small span:nth-child(2)")?.innerText,
        budget: article.querySelector(
          'li[data-test="is-fixed-price"] strong:nth-child(2)'
        )?.innerText,
        description: article.querySelector(
          'div[data-test="UpCLineClamp JobDescription"] p'
        )?.innerText,
        skills: Array.from(
          article.querySelectorAll(".air3-token-container .air3-token span")
        ).map((skill) => skill.innerText),
        // Updated and new fields
        paymentVerified:
          article
            .querySelector(
              'li[data-test="payment-verified"] .air3-badge-tagline'
            )
            ?.innerText.trim() === "Payment verified",
        clientRating: article.querySelector(
          'div[data-test="feedback-rating UpCRating"] .air3-rating-value-text'
        )?.innerText,
        clientSpent: article.querySelector('li[data-test="total-spent"] strong')
          ?.innerText,
        clientCountry: article
          .querySelector('li[data-test="location"] .air3-badge-tagline')
          ?.innerText.trim(),
      };

      return job;
    });
  });

  // console.log("Total jobs scraped:", jobs.length);

  // postedDate'i parsePostedDate fonksiyonu ile işleme
  const processedJobs = jobs.map((job) => {
    job.postedDate = parsePostedDate(job.postedDate);
    return job;
  });

  // // console.log("Processed jobs:", processedJobs);

  return processedJobs;
}

module.exports = { scrapeJobList };
