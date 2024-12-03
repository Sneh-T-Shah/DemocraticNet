const User = require("../models/User");
const ModifiedNews = require("../models/Modified");

exports.reportNews = async (req, res) => {
  const { validation } = req.body;
  const { newsId } = req.params;

  if (!validation || (validation !== "REAL" && validation !== "FAKE")) {
    return res.status(400).json({ error: "invalid validation" });
  }
  const user = req.user;
  const ministryId = user.ministryId;

  try {
    const updateNews = await ModifiedNews.findOneAndUpdate(
      { _id: newsId, ministry: { $in: [parseInt(ministryId)] } },
      { validation: validation },
      { new: true }
    );
    if (!updateNews) {
      return res.status(404).json({ error: "News not found" });
    }
    return res.status(200).json(updateNews);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
};

exports.getMinistryNews = async (req, res) => {
  const user = req.user;
  const ministryId = user.ministryId;

  console.log("ministryId", ministryId);

  const { sentiment, validation } = req.query;

  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  const querySentimentList = sentiment
    ? sentiment.split(",")
    : ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const queryValidationList = validation
    ? validation.split(",")
    : ["REAL", "FAKE", "UNVERIFIED"];

  try {
    let allnews = await ModifiedNews.find({
      ministry: { $in: [ministryId] },
      sentiment: { $in: querySentimentList },
      validation: { $in: queryValidationList },
    })
      .limit(limit)
      .skip(skip)
      .sort({ imageurl: -1 });
    return res.status(200).json(allnews);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
