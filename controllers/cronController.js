const scrapeAndSaveJobs = require("../utils/scrapeAndSaveJobs");

async function runCronJob(req, res) {
  try {
    await scrapeAndSaveJobs();
    res.status(200).json({ message: "Cron job başarıyla çalıştırıldı" });
  } catch (error) {
    console.error("Cron job çalıştırılırken hata oluştu:", error);
    res.status(500).json({
      error: "Cron job çalıştırılırken bir hata oluştu",
      details: error.message,
    });
  }
}

module.exports = { runCronJob };
