const mongoose = require("mongoose");

const bookLabModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  ename: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  pc: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  confirmation: {
    type: Array,
    default: [],
  },
  completed:{
    type:Boolean,
    default:false
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("bookLabs", bookLabModel);
