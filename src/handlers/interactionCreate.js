const configCommand = require('../commands/config');

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'config') {
        await configCommand.execute(interaction);
    }
};