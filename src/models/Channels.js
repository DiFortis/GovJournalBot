const { mongoose } = require("../config/config");

const channelSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
});

const channelsSchema = new mongoose.Schema({
  guildId: String,
  guildName: String,
  channels: [channelSchema],
});

const Channels = mongoose.model("Channels", channelsSchema);

module.exports = Channels;
