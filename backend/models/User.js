const mongoose = require("mongoose");

const Userschema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  ministryId: {
    type: Number,
    required: true,
  },
  myNewsCount: {
    type: Number,
    default: 0,
    required: true,
  },
  myReportedNews: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model("User", Userschema);
module.exports = User;
