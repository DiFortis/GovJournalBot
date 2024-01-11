const ChannelsModel = require("../models/Channels");

async function readConfig() {
  try {
    const config = await ChannelsModel.findOne({});
    return config ? config : { channels: [] };
  } catch (error) {
    console.error(`Error reading config: ${error}`);
    return { channels: [] };
  }
}

module.exports = readConfig;