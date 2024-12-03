const ModifiedNews = require("../models/Modified");
const UnModifiedNews = require("../models/UnModified");

exports.fetchAllNews = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;
  const searchQuery = req.query.search || "";
  const { sentiment, validation } = req.query;

  const querySentimentList = sentiment
    ? sentiment.split(",")
    : ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const queryValidationList = validation
    ? validation.split(",")
    : ["REAL", "FAKE", "UNVERIFIED"];

  try {
    let news;

    if (searchQuery) {
      news = await ModifiedNews.find({
        sentiment: { $in: querySentimentList },
        validation: { $in: queryValidationList },
        $text: { $search: searchQuery },
      })
        .sort({ score: { $meta: "textScore" }, imageurl: -1, publishedAt: -1 }) // Sort by relevance score and then by imageurl
        .limit(limit)
        .skip(skip);
    } else {
      news = await ModifiedNews.find({
        sentiment: { $in: querySentimentList },
        validation: { $in: queryValidationList },
      })
        .sort({ imageurl: -1, publishedAt: -1 })
        .limit(limit)
        .skip(skip);
    }

    return res.send(news);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.updateNews = async (req, res) => {
  const { newsId } = req.params;
  if (!newsId) {
    return res.status(400).send("News Id is required");
  }
  const { validation } = req.body;
  if (!validation || (validation !== "REAL" && validation !== "FAKE")) {
    return res.status(400).send("Invaalid Validation");
  }

  const user = req.user;
  const ministryId = user.ministryId;

  try {
    const updatedNews = await ModifiedNews.findByIdAndUpdate(
      newsId,
      {
        validation,
        reportedby: ministryId,
      },
      { new: true }
    );
    return res.send(updatedNews);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.findNews = async (req, res) => {
  let { titles } = req.body;

  if (!titles) {
    return res.status(400).send("Titles is required");
  }

  if (!Array.isArray(titles)) {
    return res.status(400).send("Titles should be an array");
  }

  console.log(titles);

  try {
    let news1;
    let news2;
    news1 = await ModifiedNews.find({
      title: { $in: titles },
    });

    news2 = await UnModifiedNews.find({
      title: { $in: titles },
    });

    let news = news1.concat(news2);
    return res.send(news);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
