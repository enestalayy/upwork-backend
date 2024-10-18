const express = require("express");
const filterController = require("../controllers/filterController");

const router = express.Router();

router.post("/api/user/:userId/filters", filterController.addFilter);

router.get("/api/user/:userId/filters", filterController.getFilters);

router.patch(
  "/api/user/:userId/filters/:filterId",
  filterController.updateFilter
);

router.delete(
  "/api/user/:userId/filters/:filterId",
  filterController.deleteFilter
);

module.exports = router;
