const express = require("express");
const router = express.Router();

const {
  registeruser,
  login,
  me,
} = require("../controllers/authControllers.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

router.post("/register", registeruser);
router.post("/login", login);
router.get("/me", authMiddleware, me);
module.exports = router;
