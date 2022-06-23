const mongoose = require("mongoose");

const dailyEquipmentReportModel = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  problemDomain: {
    type: JSON,
    required: true,
  },
  problemWithHardware: {
    type: Number,
    default: 0
  },
  problemWithSoftware: {
    type: Number,
    default: 0
  },
  problemWithNetworking: {
    type: Number,
    default: 0
  },
  problemWithOtherEquipment: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "dailyEquipmentReport",
  dailyEquipmentReportModel
);
