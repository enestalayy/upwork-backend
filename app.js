const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const cronRoutes = require("./routes/cronRoutes");
const filterRoutes = require("./routes/filterRoutes");
const apiKeyMiddleware = require("./middlewares/apiKeyMiddleware");
require("dotenv").config();
const app = express();

app.use(express.json());
console.log("process.env.MONGODB_URI :>> ", process.env.MONGODB_URI);

// MongoDB bağlantı fonksiyonu
const connectToMongoDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 saniye

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB'ye başarıyla bağlandı");
  } catch (err) {
    console.error("MongoDB bağlantı hatası:", err);
    if (retryCount < maxRetries) {
      console.log(`${retryDelay / 1000} saniye sonra yeniden denenecek...`);
      setTimeout(() => connectToMongoDB(retryCount + 1), retryDelay);
    } else {
      console.error(
        "Maksimum yeniden deneme sayısına ulaşıldı. Bağlantı başarısız."
      );
    }
  }
};

// İlk bağlantı denemesi
connectToMongoDB();

// Manuel yeniden bağlanma için endpoint
app.get("/reconnect", async (req, res) => {
  try {
    await mongoose.disconnect();
    await connectToMongoDB();
    res.status(200).json({ message: "MongoDB bağlantısı yeniden kuruldu" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Yeniden bağlanma başarısız", error: error.message });
  }
});

// middleware
app.use("/api", apiKeyMiddleware);

app.use(cronRoutes);
app.use(userRoutes);
app.use(filterRoutes);
app.use(jobRoutes);

app.get("/healthcheck", (req, res) => res.send("I'm alive"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Bir hata oluştu", error: err.message });
});

const scrapeJobList = require("./utils/scrape");

// Manuel scrape işlemi için yeni endpoint
app.post("/manual-scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL gereklidir" });
  }

  try {
    console.log(`Scraping jobs for URL: ${url}`);
    const jobs = await scrapeJobList(url);
    console.log(`Found ${jobs.length} jobs`);

    // İş ilanlarını işle ve sonuçları döndür
    const processedJobs = jobs.map((job) => ({
      title: job.title,
      link: job.link,
      postedDate: job.postedDate,
      clientLocation: job.clientLocation,
      paymentVerified: job.paymentVerified,
      budget: job.budget,
      description: job.description,
      skills: job.skills,
    }));

    res.json({
      message: "Scraping işlemi başarılı",
      jobCount: processedJobs.length,
      jobs: processedJobs,
    });
  } catch (error) {
    console.error("Scraping işlemi sırasında hata:", error);
    res
      .status(500)
      .json({
        error: "Scraping işlemi başarısız oldu",
        details: error.message,
      });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
module.exports = app;
