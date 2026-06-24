const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to kick").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for kick").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    }

    if (!target.kickable) {
      return interaction.reply({
        embeds: [{ color: 0xff4444, description: "❌ I cannot kick this member. They may have a higher role than me." }],
        ephemeral: true,
      });
    }

    try {
      await target.send({
        embeds: [
          {
            color: 0xff4444,
            title: "👢 You have been kicked",
            fields: [
              { name: "Server", value: interaction.guild.name, inline: true },
              { name: "Reason", value: reason, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }).catch(() => {}); // DM may fail — that's ok

      await target.kick(reason);

      await interaction.reply({
        embeds: [
          {
            color: 0xff4444,
            title: "👢 Member Kicked",
            description: `**${target.user.tag}** has been kicked from the server.`,
            fields: [{ name: "Reason", value: reason }],
            footer: { text: `By ${interaction.user.tag}` },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (err) {
      await interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ Failed: \`${err.message}\`` }], ephemeral: true });
    }
  },
};
