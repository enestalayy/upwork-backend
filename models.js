const mongoose = require("mongoose");

// User Şeması
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // E-posta
  createdAt: { type: Date, default: Date.now },
  filters: [
    {
      url: { type: String, required: true }, // İş URL'si
      name: { type: String, required: true }, // Filtre adı
      description: { type: String }, // Filtre açıklaması
      jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], // Job referansı
    },
  ],
});

// Job Şeması
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // İş açıklaması
  budget: { type: String, required: true }, // Bütçe
  description: String,
  link: { type: String, required: true }, // İşin linki
  postedDate: { type: String, required: true }, // İlanın yayınlanma tarihi
  skills: [{ type: String, required: true }], // İstenen yetenekler
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Job = mongoose.model("Job", jobSchema);

module.exports = { User, Job };
