const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`[Commands] Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[Commands] Error executing /${interaction.commandName}:`, err);
      const payload = {
        embeds: [
          {
            color: 0xff4444,
            description: "❌ An error occurred while executing this command. Please check the bot logs.",
          },
        ],
        ephemeral: true,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
