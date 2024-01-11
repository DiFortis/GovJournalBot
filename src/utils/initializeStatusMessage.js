const { EmbedBuilder } = require("discord.js");
const readConfig = require("./readConfig");

async function initializeStatusMessage(client, statusMessages) {
  const config = await readConfig();
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Status Ustaw")
    .setDescription("Monitorowanie nowych ustaw...");

  for (const channel of config.channels) {
    const discordChannel = await client.channels.fetch(channel.id);
    const message = await discordChannel.send({ embeds: [embed] });
    statusMessages.set(channel.id, message);
  }
}

module.exports = initializeStatusMessage;