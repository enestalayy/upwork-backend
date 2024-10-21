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
  };

  const multiplier = unitMultipliers[unit.replace(/s$/, "")] || 0;
  return multiplier ? new Date(now - value * multiplier) : null;
}

let browser;
let page;

// Browser'ı başlatma fonksiyonu
async function initBrowser() {
  if (!browser) {
    console.log("Browser initializing...");
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
  if (!page) {
    page = await browser.newPage();
  }
}

// Oturum kontrolü fonksiyonu
async function isLoggedIn() {
  console.log("Oturum kontrolü yapılıyor...");
  await page.goto("https://www.upwork.com/ab/account-security/login");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("Oturum kontrolü yapıldı", page.url());
  return page.url().includes("find-work");
}

// Giriş yapma fonksiyonu
async function login() {
  console.log("Giriş başladı...");
  if (!page.url().includes("login")) {
    await page.goto("https://www.upwork.com/ab/account-security/login");
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  console.log("E-posta giriliyor...");
  await page.locator("#login_username").fill(process.env.UPWORK_EMAIL);

  const usernameValue = await page.$eval("#login_username", (el) => el.value);
  console.log("E-posta girildi", usernameValue);

  await page.keyboard.press("Enter");
  console.log("username devam butonu tıklandı");

  // 3 saniye bekleme koyduktan sonra ekran görüntüsü al
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await page.type('input[id="login_password"]', process.env.UPWORK_PASS);

  console.log("Password continue clicked");

  const passwordValue = await page.$eval("#login_password", (el) => el.value);
  console.log("Şifre girildi", passwordValue);

  await page.click("input[id='login_rememberme']");

  console.log("remember me tıklandı");
  await page.click("button[id='login_control_continue']");

  await page.keyboard.press("Enter");

  console.log("Giriş yapılıyor...");
  const continueButton = await page.$("button[id='login_control_continue']");
  const continueButtonHTML = await page.evaluate(
    (el) => el.outerHTML,
    continueButton
  );

  console.log("Continue button element:", continueButton, continueButtonHTML);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Continue button element:", continueButton, continueButtonHTML);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(
    "Giriş yapma tamamlandı",
    page.url(),
    continueButton,
    continueButtonHTML
  );
}

async function scrapeJobList(url) {
  await initBrowser();

  if (!(await isLoggedIn())) {
    await login();
  }
  console.log("Giriş yapılı, scrape işlemi başlatılıyor...");

  await page.goto(url, { waitUntil: "load" });

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
        clientFeedback: article.querySelector(
          'li[data-test="total-feedback"] [data-v-abdd572e]'
        )?.innerText,
      };

      return job;
    });
  });

  console.log("Total jobs scraped:", jobs.length);

  // postedDate'i parsePostedDate fonksiyonu ile işleme
  const processedJobs = jobs.map((job) => {
    job.postedDate = parsePostedDate(job.postedDate);
    return job;
  });

  console.log("Processed jobs:", processedJobs);

  return processedJobs;
}

// Browser'ı kapatma fonksiyonu
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

module.exports = { scrapeJobList, closeBrowser };
