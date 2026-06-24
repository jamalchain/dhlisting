const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove a timeout from a member")
    .addUserOption((o) =>
      o.setName("member").setDescription("Member to unmute").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for unmute").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.reply({
        embeds: [{ color: 0xff4444, title: "❌ Error", description: "Member not found in this server." }],
        ephemeral: true,
      });
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [{ color: 0xff8c00, title: "⚠️ Not Muted", description: `<@${target.id}> doesn't have an active timeout.` }],
        ephemeral: true,
      });
    }

    try {
      await target.timeout(null, reason);
      await interaction.reply({
        embeds: [{
          color: 0x00cc66,
          title: "🔊 Member Unmuted",
          description: `<@${target.id}>'s timeout has been removed.`,
          fields: [
            { name: "Reason",    value: reason },
            { name: "Moderator", value: `<@${interaction.user.id}> · \`${interaction.user.username}\`` },
          ],
          thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
          footer: { text: "DH Listing Bot" },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [{ color: 0xff4444, title: "❌ Failed", description: `\`${err.message}\`` }],
        ephemeral: true,
      });
    }
  },
};
