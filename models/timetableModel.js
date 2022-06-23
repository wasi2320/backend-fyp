const mongoose = require("mongoose");

const timetableModel = new mongoose.Schema({
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "labs",
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  updatedAt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("timetables", timetableModel);
