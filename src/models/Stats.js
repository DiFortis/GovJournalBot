const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  lawsCount: {
    type: Number,
    required: true,
  },
});

const Stats = mongoose.model("Stats", statsSchema);

module.exports = Stats;
