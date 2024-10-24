// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// İş ilanlarını listeleme
router.get("/api/jobs/:filterId", jobController.getJobsByFilter);
router.get("/api/job/:jobId", jobController.getJob);

module.exports = router;
