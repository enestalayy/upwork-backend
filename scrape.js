const puppeteer = require("puppeteer");

async function scrapeJobList(url) {
  // Tarayıcıyı başlat
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
  console.log("browser :>> ", browser);
  const page = await browser.newPage();
  console.log("page :>> ", page);

  // İlgili URL'ye git
  await page.goto(url);

  // Sayfanın tamamen yüklenmesini bekle
  await page.waitForSelector("section");

  // `article` etiketlerini seç ve gerekli bilgileri çek
  const jobListings = await page.evaluate(() => {
    // Tüm article elemanlarını seç
    const articles = document.querySelectorAll("section article");

    // Her bir article'dan istenilen bilgileri al
    let jobs = [];
    articles.forEach((article) => {
      let job = {
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
        // 'air3-token-container' içindeki etiketleri çekme
        skills: Array.from(
          article.querySelectorAll(".air3-token-container .air3-token span")
        ).map((skill) => skill.innerText),
      };
      jobs.push(job);
    });

    return jobs;
  });

  console.log(jobListings);

  // Tarayıcıyı kapat
  await browser.close();
}

module.exports = scrapeJobList;
