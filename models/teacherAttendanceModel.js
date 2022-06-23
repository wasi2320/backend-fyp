const mongoose = require("mongoose");

const teacherAttendanceModel = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "timetables",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  confirmation: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("teacherAttendances", teacherAttendanceModel);
