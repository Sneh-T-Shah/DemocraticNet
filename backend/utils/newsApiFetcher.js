const axios = require("axios");

const newsApiKey = "cbeed8baaadc41358cf2fab0de7e86c3";

let newsApiUrl = (countryCode) =>
  `https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=100&apiKey=${newsApiKey}`;

const topCountriesCode = ["in", "us", "au", "nz", "ca", "gb", "ie", "za", "sg"];

const ModifiedNews = require("../models/Modified");
const UnModifiedNews = require("../models/UnModified");

const saveToDB = async (news) => {
  try {
    const dbNews = await ModifiedNews.findOne({
      title: news.title,
      source: news.source,
    });

    if (!dbNews) {
      await UnModifiedNews.create(news);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error saving news:", error.message);
  }
};

const getNewsApiNews = async () => {
  let failedToSaveCount = 0;
  let savedCount = 0;
  for (const countryCode of topCountriesCode) {
    try {
      let response = await fetch(newsApiUrl(countryCode));
      const data = await response.json();

      data.articles.forEach(async (element) => {
        let { title, author, publishedAt, urlToImage: imageurl, url } = element;
        let description =
          (element.description || "") + " " + (element.content || "");
        let source = element.source.name;

        let newjson = {
          title,
          description,
          url,
          imageurl,
          publishedAt,
          source,
          author,
        };

        let saved = await saveToDB(newjson);
        if (!saved) {
          failedToSaveCount++;
        } else {
          savedCount++;
        }
      });
    } catch (error) {
      console.log(`Error fetching news for country ${countryCode}:`, error);
    }
  }

  console.log(`Saved ${savedCount} news articles in Top headlines NewsApi`);
  console.log(
    `Failed to save ${failedToSaveCount} news articles in Top headlines NewsApi`
  );
};

const getScrapperNews = async () => {
  let failedToSaveCount = 0;
  let savedCount = 0;

  try {
    let response = await fetch("http://127.0.0.1:8000/get_list");

    if (response.status !== 200) {
      console.log("Error in fetching news from backend");
      return;
    }

    const data = await response.json();

    console.log("Fetched news from scrapper:", data.length);

    data.forEach(async (element) => {
      let { title, description, source, author, publishedAt, imageUrl, url } =
        element;

      if (publishedAt == null) {
        publishedAt = new Date().toISOString();
      }

      let newjson = {
        title,
        description,
        url,
        imageUrl,
        publishedAt,
        source,
        author,
      };

      const saved = await saveToDB(newjson);

      if (!saved) {
        failedToSaveCount++;
      } else {
        savedCount++;
      }
    });
  } catch (error) {
    console.log("Error in fetching scrapped news:", error.message);
  }

  console.log(`Saved ${savedCount} news articles in Scrapper News`);
  console.log(
    `Failed to save ${failedToSaveCount} news articles in Scrapper News`
  );
};

const fetchAllNewsNewsApi = async () => {
  let failedToSaveCount = 0;
  let savedCount = 0;
  let fetchFails = 0;
  const pageSize = 50;
  const sortByOptions = ["popularity", "publishedAt"];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 2);
  const formattedFromDate = fromDate.toISOString();
  const queryList = [
    "+india",
    "+stock",
    "+usa",
    "+china",
    "+russia",
    "+uk",
    "+japan",
    "+germany",
    "+canada",
    "+australia",
    "+finance",
    "+business",
    "+technology",
    "+hospital",
    "+health",
    "+mumbai",
    "+kolkata",
    "+delhi",
    "+chennai",
    "+bangalore",
    "+hyderabad",
    "+pune",
    "+ahmedabad",
    "+surat",
    "+sports",
    "+science",
    "+world",
    "+politics",
    "+economy",
    "+education",
    "+environment",
    "+google",
    "+apple",
    "+amazon",
    "+facebook",
    "+instagram",
    "+twitter",
    "+x",
    "+microsoft",
    "+bjp",
    "+radio",
    "+social media",
    "+modi",
    "+mamata",
  ];

  for (const query of queryList) {
    if (fetchFails >= 5) {
      console.error("Too many fetch fails. Exiting fetch.");
      break;
    }
    for (const sortBy of sortByOptions) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          query
        )}&from=${formattedFromDate}&sortBy=${sortBy}&language=en&pageSize=${pageSize}&page=1&apiKey=${newsApiKey}`;

        console.log("Fetching URL: ", url);

        const response = await fetch(url);

        if (!response.ok) {
          fetchFails++;
          throw new Error(
            `Error fetching news with query=${query} and sortBy=${sortBy}: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.status === "ok") {
          data.articles.forEach(async (element) => {
            const {
              title,
              author,
              publishedAt,
              urlToImage: imageurl,
              url,
              source: { name: source },
            } = element;

            const description =
              (element.description || "") + " " + (element.content || "");

            const newjson = {
              title,
              description,
              url,
              imageurl,
              publishedAt,
              source,
              author,
            };

            const saved = await saveToDB(newjson);

            if (!saved) {
              failedToSaveCount++;
            } else {
              savedCount++;
            }
          });
          console.log(
            `Fetched ${data.articles.length} articles for query=${query} sorted by ${sortBy}.`
          );
        } else {
          console.error(
            `Error fetching news with query=${query} and sortBy=${sortBy}:`,
            data.message
          );
        }
      } catch (error) {
        console.error(
          `Error fetching news with query=${query} and sortBy=${sortBy}:`,
          error.message
        );
      }
    }
  }

  console.log(`Saved ${savedCount} news articles in Trending News`);

  console.log(
    `Failed to save ${failedToSaveCount} news articles in Trending News`
  );
};
module.exports = { getNewsApiNews, getScrapperNews, fetchAllNewsNewsApi };
