const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { DISCORD_TOKEN } = require("./config/config");
const ActsModel = require("./models/Acts");
const ChannelsModel = require("./models/Channels");
const StatsModel = require("./models/Stats");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const SEJM_API_URL = "https://api.sejm.gov.pl/eli/acts/DU";

client.once("ready", () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
  initializeStatusMessage();
  checkForNewLaws();
  setInterval(checkForNewLaws, 3600000);
});

let statusMessages = new Map();

async function initializeStatusMessage() {
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

async function checkForNewLaws() {
  console.log("Sprawdzanie nowych ustaw...");
  try {
    const currentYear = new Date().getFullYear();
    console.log(`Wysyłanie zapytania do API dla roku: ${currentYear}`);
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
            {
              name: "Data ogłoszenia",
              value: law.announcementDate,
              inline: true,
            },
            { name: "Data promulgacji", value: law.promulgation, inline: true },
            { name: "Status", value: law.status },
            {
              name: "Link",
              value: `https://api.sejm.gov.pl/eli/acts/DU/${law.year}/${law.ELI}`,
              inline: false,
            }
          )
          .setColor("#0099ff");

        for (const [channelId] of statusMessages) {
          const discordChannel = await client.channels.fetch(channelId);
          await discordChannel.send({ embeds: [embed] });
        }
      }
    }
  } catch (error) {
    console.error("Błąd podczas pobierania nowych ustaw: serwer niedostępny.",);
    if (error.response && error.response.status === 503) {
      await updateStatusMessages("Serwer API tymczasowo niedostępny.");
    }
  }
}

async function updateStatusMessages(statusText) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Status Ustaw")
    .setDescription(statusText);

  for (const [channelId] of statusMessages) {
    const message = statusMessages.get(channelId);
    if (message) {
      message.edit({ embeds: [embed] });
    } else {
      console.log(`Nie znaleziono wiadomości dla kanału: ${channelId}`);
    }
  }
}

async function readConfig() {
  try {
    const config = await ChannelsModel.findOne({});
    return config ? config : { channels: [] };
  } catch (error) {
    console.error(`Error reading config: ${error}`);
    return { channels: [] };
  }
}

client.on("interactionCreate", require("./handlers/interactionCreate"));

client.login(DISCORD_TOKEN);