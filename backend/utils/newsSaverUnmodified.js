const {
  getNewsApiNews,
  getScrapperNews,
  fetchAllNewsNewsApi,
} = require("./newsApiFetcher");

const newsSaverUnmodified = async () => {
  // await getNewsApiNews();
  await fetchAllNewsNewsApi();
  // await getScrapperNews();
  return 1;
};

module.exports = newsSaverUnmodified;
