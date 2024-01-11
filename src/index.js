const { Client, GatewayIntentBits } = require("discord.js");
const { DISCORD_TOKEN } = require("./config/config");
const initializeStatusMessage = require("./utils/initializeStatusMessage");
const checkForNewLaws = require("./utils/checkForNewLaws");
const ChannelsModel = require("./models/Channels");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const SEJM_API_URL = "https://api.sejm.gov.pl/eli/acts/DU";
let statusMessages = new Map();

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
  await initializeStatusMessage(client, statusMessages);
  checkForNewLaws(client, statusMessages, SEJM_API_URL);
  setInterval(() => checkForNewLaws(client, statusMessages, SEJM_API_URL), 3600000);
});

client.on("interactionCreate", require("./handlers/interactionCreate"));

client.login(DISCORD_TOKEN);