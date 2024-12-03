const express = require("express");
const router = express.Router();
const { fetchAllNews,findNews } = require("../controllers/newsControllers.js");

router.get("/", fetchAllNews);
router.post("/find", findNews);
module.exports = router;
