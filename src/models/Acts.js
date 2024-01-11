const mongoose = require('mongoose');

const actSchema = new mongoose.Schema({
    ELI: String,
    title: String,
    type: String,
    announcementDate: String,
    promulgation: String,
    status: String,
    year: Number
});

const Acts = mongoose.model('Acts', actSchema);

module.exports = Acts;