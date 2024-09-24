const express = require("express");
const cron = require("node-cron");
const scrapeJobList = require("./scrape");
const mongoose = require("mongoose");
const { User, Job } = require("./models"); // MongoDB modellerimizi import ediyoruz

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye başarıyla bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// // Tek kullanıcıyı oluştur (eğer yoksa)
// async function createDefaultUser() {
//   try {
//     const user = await User.findOne({ username: "defaultuser" });
//     if (!user) {
//       await User.create({
//         name: "Yigit",
//         surname: "Cakmak",
//         email: "work@yigitcakmak.com",
//       });
//       console.log("Varsayılan kullanıcı oluşturuldu");
//     }
//   } catch (error) {
//     console.error("Kullanıcı oluşturma hatası:", error);
//   }
// }

// createDefaultUser();

async function scrapeAndSaveJobs() {
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
  } catch (error) {
    console.error("Scrape ve kaydetme işlemi sırasında hata:", error);
  }
}

cron.schedule("*/5 * * * *", () => {
  console.log("Cron job tetiklendi: Scrape işlemi başlatılıyor...");
  scrapeAndSaveJobs();
});

app.get("/", (req, res) => {
  res.send("Scraping cron job çalışıyor!");
});

// Yeni filter oluşturma endpoint'i
app.post("/api/filters", async (req, res) => {
  try {
    const { email, filterData } = req.body;

    if (!email || !filterData || !filterData.url || !filterData.name) {
      return res.status(400).json({ error: "Gerekli alanlar eksik" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    user.filters.push({
      url: filterData.url,
      name: filterData.name,
      description: filterData.description || "",
      jobs: [],
    });

    await user.save();

    res.status(201).json({
      message: "Filter başarıyla oluşturuldu",
      filter: user.filters[user.filters.length - 1],
    });
  } catch (error) {
    console.error("Filter oluşturma hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} üzerinde çalışıyor...`);
});
