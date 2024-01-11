const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    month: Number,
    lawsCount: Number
});

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;