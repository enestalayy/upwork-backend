// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// İş ilanlarını listeleme
router.get("/api/jobs/:filterId", jobController.getJobsByFilter);

module.exports = router;
