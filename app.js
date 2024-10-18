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

app.get("/healthcheck", (req, res) => res.send("I'm alive"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Bir hata oluştu", error: err.message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
