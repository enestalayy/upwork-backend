const express = require("express");
const scrapeJobList = require("../../scrape");
const mongoose = require("mongoose");
const { User, Job } = require("../../models");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye başarıyla bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

module.exports = async (req, res) => {
  try {
    const users = await User.find({});
    for (let user of users) {
      for (let filter of user.filters) {
        const scrapedJobs = await scrapeJobList(filter.url);
        const savedJobs = await Promise.all(
          scrapedJobs.map(async (jobData) => {
            const newJob = new Job(jobData);
            await newJob.save();
            return newJob._id;
          })
        );
        filter.jobs = savedJobs;
        await user.save();
      }
    }
    console.log("Tüm kullanıcılar için işler scrape edildi ve kaydedildi.");
    res.status(200).json({ message: "Cron job başarıyla çalıştı" });
  } catch (error) {
    console.error("Cron job hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
