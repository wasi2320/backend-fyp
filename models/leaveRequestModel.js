const mongoose = require("mongoose");

const leaveRequestModel = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  attachment: {
    type: String, default: "",
  },
  confirmation1: {
    type: Boolean,
    default: false,
  },
  confirmation2: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("leaveRequests", leaveRequestModel);
