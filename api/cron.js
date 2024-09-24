const scrapeJobList = require("../scrape");
const mongoose = require("mongoose");
const { User, Job } = require("../models");

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye başarıyla bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const now = new Date();
      console.log(`Cron job çalıştı: ${now.toISOString()}`);

      const users = await User.find({});
      const user = users[0];
      for (let filter of user.filters) {
        console.log("filter.url :>> ", filter.url);
        //     const scrapedJobs = await scrapeJobList(filter.url);
        //     const savedJobs = await Promise.all(
        //       scrapedJobs.map(async (jobData) => {
        //         const newJob = new Job(jobData);
        //         await newJob.save();
        //         return newJob._id;
        //       })
        //     );
        //     filter.jobs = savedJobs;
        //     await user.save();
      }

      console.log("Tüm kullanıcılar için işler scrape edildi ve kaydedildi.");
      res.status(200).json({
        message: "Cron job başarıyla çalıştı",
        user,
        timestamp: now.toISOString(),
      });
    } catch (error) {
      console.error("Cron job hatası:", error);
      res.status(500).json({ error: "Sunucu hatası", details: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
