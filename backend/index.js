const express = require("express");
const cors = require("cors");
const connectDB = require("./db.js");
const newsSaverUnmodified = require("./utils/newsSaverUnmodified.js");
const newsSaverModified = require("./utils/newsSaverModified.js");
const {
  deleteOldNews,
  deleteDuplicateNews,
} = require("./utils/oldNewsDeletor.js");
const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/delete-old-news", async (req, res) => {
  await deleteOldNews();
  res.send("old news deleted successfully");
});

app.get("/delete-duplicate-news", async (req, res) => {
  await deleteDuplicateNews();
  res.send("duplicate news deleted successfully");
});

app.get("/save-new-news", async (req, res) => {
  const savedCount = await newsSaverUnmodified();
  res.send(`${savedCount} News saved successfully`);
});

app.get("/classity-news", async (req, res) => {
  await newsSaverModified();
  res.send("all news classified successfully");
});

app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/news", require("./routes/newsRoutes.js"));
app.use("/api/ministry", require("./routes/ministryRoutes.js"));

app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  connectDB();
});

// setInterval(async () => {
//   console.log("newsSaverModified called");
//   await newsSaverModified();
// }, 20 * 1000);

// setInterval(async () => {
//   console.log("new news fetching called");
//   await fetch("http://localhost:5000/save-new-news");
// }, 10 * 60 * 1000);
