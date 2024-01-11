const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
const ActsModel = require("../models/Acts");
const StatsModel = require("../models/Stats");
const updateStatusMessages = require("./updateStatusMessages");

async function checkForNewLaws(client, statusMessages, SEJM_API_URL) {
  console.log("Sprawdzanie nowych ustaw...");
  try {
    const currentYear = new Date().getFullYear();
    const response = await axios.get(`${SEJM_API_URL}/${currentYear}`);
    const laws = response.data.items;

    for (const law of laws) {
      const existingLaw = await ActsModel.findOne({ ELI: law.ELI });
      if (!existingLaw) {
        const newLaw = new ActsModel({ ...law });
        await newLaw.save();

        const currentMonth = new Date().getMonth();
        const stats =
          (await StatsModel.findOne({ month: currentMonth })) ||
          new StatsModel({ month: currentMonth, lawsCount: 0 });
        stats.lawsCount += 1;
        await stats.save();

        const embed = new EmbedBuilder()
          .setTitle("Nowa Ustawa")
          .setDescription(`${law.title} (${law.type})`)
          .addFields(
            { name: "Data ogłoszenia", value: law.announcementDate, inline: true },
            { name: "Data promulgacji", value: law.promulgation, inline: true },
            { name: "Status", value: law.status },
            { name: "Link", value: `https://api.sejm.gov.pl/eli/acts/DU/${law.year}/${law.ELI}`, inline: false }
          )
          .setColor("#0099ff");

        for (const [channelId] of statusMessages) {
          const discordChannel = await client.channels.fetch(channelId);
          await discordChannel.send({ embeds: [embed] });
        }
      }
    }
  } catch (error) {
    console.error("Błąd podczas pobierania nowych ustaw: Serwer API tymczasowo niedostępny.");
    if (error.response && error.response.status === 503) {
      await updateStatusMessages(statusMessages, "Serwer API tymczasowo niedostępny.");
    }
  }
}

module.exports = checkForNewLaws;