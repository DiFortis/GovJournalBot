const { EmbedBuilder } = require("discord.js");

async function updateStatusMessages(statusMessages, statusText) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Status Ustaw")
    .setDescription(statusText);

  for (const [channelId, message] of statusMessages) {
    if (message) {
      await message.edit({ embeds: [embed] });
    } else {
      console.log(`Nie znaleziono wiadomości dla kanału: ${channelId}`);
    }
  }
}

module.exports = updateStatusMessages;