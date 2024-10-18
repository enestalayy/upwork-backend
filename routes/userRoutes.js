const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/api/user/:userId", userController.createUser);

router.get("/api/user/:userId", userController.getUser);

router.patch("/api/user/:userId", userController.updateUser);

router.delete("/api/user/:userId", userController.deleteUser);
module.exports = router;
