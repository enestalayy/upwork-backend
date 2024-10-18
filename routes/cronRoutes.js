const express = require("express");
const cronController = require("../controllers/cronController");

const router = express.Router();

router.get("/api/cron", cronController.runCronJob);

module.exports = router;
