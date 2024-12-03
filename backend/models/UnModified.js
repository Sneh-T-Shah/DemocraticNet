const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  author: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  tag: {
    type: String,
    default: "general",
  },
  url: {
    type: String,
    default: "",
  },
  imageurl: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: "english",
  },
  geolocation: {
    type: String,
    default: "india",
  },
  publishedAt: {
    type: Date,
    default: Date.now(),
  },
  DBcreatedAt: {
    type: Date,
    default: Date.now(),
  },
  source: {
    type: String,
    default: "",
  },
  sentiment: {
    type: String,
    default: "",
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
  validation: {
    type: String,
    default: "UNVERIFIED",
  },
  AIValidation: {
    type: String,
    default: "UNVERIFIED",
  },
  ministry: {
    type: Array,
    default: [],
  },
  reportedby: {
    type: String,
    default: "",
  },
});

NewsSchema.index({
  title: "text",
  description: "text",
  author: "text",
  source: "text",
});

const UnModifiedNews = mongoose.model("UnModifiedNews", NewsSchema);
module.exports = UnModifiedNews;
