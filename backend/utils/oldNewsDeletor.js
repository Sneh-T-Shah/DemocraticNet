const ModifiedNews = require("../models/Modified");
const UnModifiedNews = require("../models/UnModified");
async function deleteOldNews() {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 2);

    const result1 = await UnModifiedNews.deleteMany({
      publishedAt: { $lt: fiveDaysAgo },
    });

    const result = await ModifiedNews.deleteMany({
      publishedAt: { $lt: fiveDaysAgo },
    });

    console.log(
      `${result.deletedCount + result1.deletedCount} news articles deleted`
    );
  } catch (error) {
    console.error("Error deleting old news:", error);
  }
}

async function deleteDuplicateNews() {
  try {
    let duplicates = await ModifiedNews.aggregate([
      {
        $group: {
          _id: { title: "$title", source: "$source" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    for (const duplicate of duplicates) {
      const idsToDelete = duplicate.uniqueIds.slice(1);
      await ModifiedNews.deleteMany({ _id: { $in: idsToDelete } });
    }

    duplicates = await UnModifiedNews.aggregate([
      {
        $group: {
          _id: { title: "$title", source: "$source" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    for (const duplicate of duplicates) {
      const idsToDelete = duplicate.uniqueIds.slice(1);
      await ModifiedNews.deleteMany({ _id: { $in: idsToDelete } });
    }

    console.log("Duplicate news entries deleted successfully.");
  } catch (error) {
    console.error("Error deleting duplicate news entries:", error);
  }
}

module.exports = { deleteOldNews, deleteDuplicateNews };
