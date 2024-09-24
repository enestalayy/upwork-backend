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

const userData = {
  name: "Yigit",
  surname: "Cakmak",
  email: "work@yigitcakmak.com",
  createdAt: new Date(1727177206682),
  filters: [
    {
      url: "https://www.upwork.com/nx/search/jobs/?client_hires=1-9,10-&payment_verified=1&q=%28html,%20OR%20css,%20OR%20javascript,%20OR%20figma,%20OR%20tailwind,%20OR%20bootstrap%29%20AND%20NOT%20%28adobe,%20OR%20wordpress,%20OR%20shopify,%20OR%20laravel,%20OR%20symfony,%20OR%20aws,%20OR%20kotlin,%20OR%20salesforce,%20OR%20sap,%20OR%20swift,%20OR%20mysql,%20OR%20ruby,%20OR%20nginx,%20OR%20java,%20OR%20matlab,%20OR%20c%2B%2B,%20OR%20c%23,%20OR%20azure%20OR%20php,%20OR%20ios,%20OR%20android%20OR%20django%29&t=1",
      name: "Web Development Jobs",
      description: "Latest web development job postings",
      jobs: [],
    },
  ],
};

async function addUserIfNotExist() {
  try {
    // Kullanıcıyı email adresine göre kontrol et
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log("Kullanıcı zaten mevcut:", existingUser);
    } else {
      // Kullanıcı yoksa yeni bir kullanıcı oluştur ve kaydet
      const newUser = new User(userData);
      await newUser.save();
      console.log("Yeni kullanıcı eklendi:", newUser);
    }
  } catch (err) {
    console.error("Kullanıcı eklerken hata oluştu:", err);
  }
}

// Fonksiyonu çağır
addUserIfNotExist();

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const now = new Date();
      console.log(`Cron job çalıştı: ${now.toISOString()}`);

      const users = await User.find({});
      const user = users[0];
      for (let filter of user.filters) {
        console.log("filter.url :>> ", filter.url);
        const scrapedJobs = await scrapeJobList(filter.url);
        console.log("scrapedJobs :>> ", scrapedJobs);
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
