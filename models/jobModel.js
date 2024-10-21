const mongoose = require("mongoose");

// Job Şeması
const jobSchema = new mongoose.Schema({
  filterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User.filters",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true }, // İş açıklaması
  budget: { type: String, required: true }, // Bütçe
  link: { type: String, required: true }, // İşin linki
  postedDate: { type: Date, required: true }, // İlanın yayınlanma tarihi
  skills: [{ type: String, required: true }], // İstenen yetenekler
  coverLetter: { type: String, required: true }, // Ön yazı
  createdAt: { type: Date, default: Date.now },
  // Yeni eklenen alanlar
  paymentVerified: { type: Boolean, default: false },
  clientRating: { type: String },
  clientSpent: { type: String },
  clientCountry: { type: String },
  clientFeedback: { type: String },
});

module.exports = mongoose.model("Job", jobSchema);
