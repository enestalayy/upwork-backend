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

//   const users = await User.find({});
//   for (let user of users) {
//     for (let filter of user.filters) {
//       const scrapedJobs = await scrapeJobList(filter.url);
//       const savedJobs = await Promise.all(
//         scrapedJobs.map(async (jobData) => {
//           const newJob = new Job(jobData);
//           await newJob.save();
//           return newJob._id;
//         })
//       );
//       filter.jobs = savedJobs;
//       await user.save();
//     }
//   }

// if (
//   req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
// ) {
//   return res.status(401).end("Unauthorized");
// } else
