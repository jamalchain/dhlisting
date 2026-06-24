const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove timeout from a member")
    .addUserOption((o) => o.setName("member").setDescription("Member to unmute").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    if (!target.isCommunicationDisabled()) return interaction.reply({ embeds: [{ color: 0xff8c00, description: `⚠️ <@${target.id}> is not muted.` }], ephemeral: true });

    try {
      await target.timeout(null, reason);
      await interaction.reply({
        embeds: [{
          color: 0x00cc66, title: "🔊 Member Unmuted",
          description: `<@${target.id}>'s timeout has been removed.`,
          fields: [{ name: "Reason", value: reason }],
          footer: { text: `By ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      await interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ Failed: \`${err.message}\`` }], ephemeral: true });
    }
  },
};
