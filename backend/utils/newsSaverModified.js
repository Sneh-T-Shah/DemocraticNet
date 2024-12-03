const UnModifiedNews = require("../models/UnModified");
const ModifiedNews = require("../models/Modified");

const newsSaverModified = async () => {
  const newsArray = await UnModifiedNews.find({});
  let classifiedCount = 0;
  let errorCount = 0;

  for (const element of newsArray) {
    if (errorCount > 5) {
      break;
    }

    let data = element._doc;
    const payload = {
      title: data.title,
      description: data.description,
    };

    try {
      const response = await fetch("http://localhost:8000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const aiValidationResponse = await fetch(
        "http://localhost:8000/predict-ai-validation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: data.title + data.description }),
        }
      );

      let aiValidationData;

      if (aiValidationResponse.status === 200) {
        aiValidationData = await aiValidationResponse.json();
      } else {
        aiValidationData = { prediction: "UNVERIFIED" };
      }

      console.log("ai validation data:", aiValidationData);

      data.AIValidation = aiValidationData.prediction;

      if (response.status !== 200) {
        errorCount += 1;
        continue;
      }

      const responseData = await response.json();
      console.log("response data:", responseData);

      let sentimentScore = responseData.sentiment_score;
      let ministries = responseData.ministry_list;
      let sentiment;

      if (sentimentScore < -0.3) {
        sentiment = "NEGATIVE";
      } else if (sentimentScore > 0.3) {
        sentiment = "POSITIVE";
      } else {
        sentiment = "NEUTRAL";
      }

      data.sentiment = sentiment;
      data.sentimentScore = sentimentScore;
      data.ministry = ministries;
    } catch (error) {
      errorCount += 1;
      console.log("error in fetching news");
      continue;
    }

    try {
      await ModifiedNews.create(data);
      await UnModifiedNews.findByIdAndDelete(element._id);
    } catch (error) {
      console.log("duplicate news or error in saving news");
      continue;
    }

    classifiedCount += 1;
  }

  console.log("classifiedCount", classifiedCount);
  return classifiedCount;
};

module.exports = newsSaverModified;
