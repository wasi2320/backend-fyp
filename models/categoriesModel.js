const mongoose = require("mongoose");

const categoriesModel = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    }, name: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("categories", categoriesModel);
