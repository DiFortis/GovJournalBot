const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
const ActsModel = require("../models/Acts");
const StatsModel = require("../models/Stats");
const updateStatusMessages = require("./updateStatusMessages");

const SEJM_API_URL = "https://api.sejm.gov.pl/eli/acts/DU";

async function checkForNewLaws(client, statusMessages) {
  try {
    const currentYear = new Date().getFullYear();
    const response = await axios.get(`${SEJM_API_URL}/${currentYear}`);
    const laws = response.data.items;

    for (const law of laws) {
      const existingLaw = await ActsModel.findOne({ ELI: law.ELI });
      if (!existingLaw) {
        const newLaw = new ActsModel({ ...law });
        await newLaw.save();

        const detailedLawURL = `${SEJM_API_URL}/${law.year}/${law.pos}`;
        const detailedResponse = await axios.get(detailedLawURL);
        const detailedLaw = detailedResponse.data;

        const currentMonth = new Date().getMonth() + 1;
        const stats =
          (await StatsModel.findOne({ month: currentMonth })) ||
          new StatsModel({ month: currentMonth, year: currentYear, lawsCount: 0 });
        stats.lawsCount += 1;
        await stats.save();

        const embed = new EmbedBuilder()
          .setTitle("Nowa Ustawa")
          .setDescription(`${detailedLaw.title} (${detailedLaw.type})`)
          .addFields(
            { name: "Data ogłoszenia", value: detailedLaw.announcementDate, inline: true },
            { name: "Data promulgacji", value: detailedLaw.promulgation, inline: true },
            { name: "Status", value: detailedLaw.status },
            { name: "Typ aktu prawnego", value: detailedLaw.type, inline: true },
            { name: "Tekst jednolity", value: detailedLaw.references?.['Tekst jednolity dla aktu']?.[0]?.id ? `https://dziennikustaw.gov.pl/${detailedLaw.references['Tekst jednolity dla aktu'][0].id}` : 'Brak dostępnego tekstu jednolitego', inline: false },
            { name: "Słowa kluczowe", value: detailedLaw.keywords?.length > 0 ? detailedLaw.keywords.join(', ') : 'Brak słów kluczowych' },
            { name: "Wydany przez", value: detailedLaw.releasedBy?.length > 0 ? detailedLaw.releasedBy.join(', ') : 'Brak informacji o wydawcy' },
            { name: "Link", value: `https://dziennikustaw.gov.pl/${detailedLaw.ELI}`, inline: false }
          )
          .setColor("#0099ff");

        for (const [channelId] of statusMessages) {
          const discordChannel = await client.channels.fetch(channelId);
          await discordChannel.send({ embeds: [embed] });
        }
      } 
    }
  } catch (error) {
    console.error("Błąd podczas pobierania nowych ustaw:", error.message);
    if (error.response && error.response.status === 503) {
      console.log("Błąd 503: Serwer API tymczasowo niedostępny.");
      await updateStatusMessages(statusMessages, "Serwer API tymczasowo niedostępny.");
    }
  }
}

module.exports = checkForNewLaws;