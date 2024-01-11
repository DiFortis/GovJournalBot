const { SlashCommandBuilder } = require('@discordjs/builders');
const Channels = require('../models/Channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure channels for logging')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a channel to the configuration')
                .addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a channel from the configuration')
                .addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show the current configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear the configuration')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await addChannel(interaction);
                break;
            case 'remove':
                await removeChannel(interaction);
                break;
            case 'show':
                await showConfig(interaction);
                break;
            case 'clear':
                await clearConfig(interaction);
                break;
        }
    },
};

function getChannelType(typeNumber) {
    const channelTypes = {
        0: 'GUILD_TEXT', // tekstowy
        1: 'DM', // wiadomości bezpośrednie
        2: 'GUILD_VOICE', // głosowy
        3: 'GROUP_DM', // grupowa wiadomość bezpośrednia
        4: 'GUILD_CATEGORY', // kategoria kanałów
        5: 'GUILD_NEWS', // kanał ogłoszeniowy
        6: 'GUILD_STORE', // sklep
        10: 'GUILD_NEWS_THREAD', // wątek ogłoszeniowy
        11: 'GUILD_PUBLIC_THREAD', // publiczny wątek
        12: 'GUILD_PRIVATE_THREAD', // prywatny wątek
        13: 'GUILD_STAGE_VOICE', // scena głosowa
        14: 'GUILD_DIRECTORY', // katalog
        15: 'GUILD_FORUM', // forum
    };

    return channelTypes[typeNumber] || 'Unknown';
}

async function addChannel(interaction) {
    const channel = interaction.options.getChannel('channel');
    const channelId = channel.id;
    const channelName = channel.name;
    const channelType = getChannelType(channel.type);

    const config = await Channels.findOne({ guildId: interaction.guild.id }) || new Channels({ guildId: interaction.guild.id, guildName: interaction.guild.name, channels: [] });

    if (!config.channels.some(c => c.id === channelId)) {
        config.channels.push({ id: channelId, name: channelName, type: channelType });
        await config.save();
        await interaction.reply(`Channel <#${channelId}> added to the configuration.`);
    } else {
        await interaction.reply(`Channel <#${channelId}> is already in the configuration.`);
    }
}

async function removeChannel(interaction) {
    const channel = interaction.options.getChannel('channel');
    const channelId = channel.id;

    const config = await Channels.findOne({ guildId: interaction.guild.id });

    if (config && config.channels.some(c => c.id === channelId)) {
        config.channels = config.channels.filter(c => c.id !== channelId);
        await config.save();
        await interaction.reply(`Channel <#${channelId}> removed from the configuration.`);
    } else {
        await interaction.reply(`Channel <#${channelId}> is not in the configuration.`);
    }
}

async function showConfig(interaction) {
    const config = await Channels.findOne({ guildId: interaction.guild.id });

    if (config && config.channels.length > 0) {
        const channelLinks = config.channels.map(channel => `<#${channel.id}>`).join(', ');
        await interaction.reply(`Current configuration: ${channelLinks}`);
    } else {
        await interaction.reply('No channels are currently configured.');
    }
}

async function clearConfig(interaction) {
    await Channels.deleteOne({ guildId: interaction.guild.id });
    await interaction.reply('Configuration cleared.');
}