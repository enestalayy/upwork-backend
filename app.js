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

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye başarıyla bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// middleware
app.use("/api", apiKeyMiddleware);

app.use(cronRoutes);
app.use(userRoutes);
app.use(filterRoutes);
app.use(jobRoutes);

// Manuel yeniden bağlanma için endpoint
app.get("/reconnect", async (req, res) => {
  try {
    await mongoose.disconnect();
    await mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("MongoDB'ye başarıyla bağlandı"))
      .catch((err) => console.error("MongoDB bağlantı hatası:", err));
    res.status(200).json({ message: "MongoDB bağlantısı yeniden kuruldu" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Yeniden bağlanma başarısız", error: error.message });
  }
});

app.get("/healthcheck", (req, res) => res.send("I'm alive"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Bir hata oluştu", error: err.message });
});
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
module.exports = app;
