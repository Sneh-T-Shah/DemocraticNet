const express = require("express");
const router = express.Router();

const {
  getMinistryNews,
  reportNews,
} = require("../controllers/ministryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.put("/news/:newsId", authMiddleware, reportNews);
router.get("/news", authMiddleware, getMinistryNews);
// router.get("/stats", fetchuser, stats);

module.exports = router;
