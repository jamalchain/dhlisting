const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uncage")
    .setDescription("Release a member from the cage (removes the jail role)")
    .addUserOption((o) =>
      o.setName("member").setDescription("Member to release").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for release").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Error", description: "Member not found in this server." }],
      });
    }

    const jailRoleName = (process.env.JAIL_ROLE_NAME || "Caged").toLowerCase();
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName
    );

    if (!jailRole || !target.roles.cache.has(jailRole.id)) {
      return interaction.editReply({
        embeds: [{ color: 0xff8c00, title: "⚠️ Not Caged", description: `<@${target.id}> is not currently in the cage.` }],
      });
    }

    try {
      await target.roles.remove(jailRole, reason);

      await sendLog(
        interaction.client,
        buildLog({ action: "UNCAGE", moderator: interaction.user, target: target.user, reason })
      );

      await interaction.editReply({
        embeds: [{
          color: 0x00cc66,
          title: "🔓 Member Released",
          description: `<@${target.id}> has been released from the cage.`,
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
      console.error(err);
      await interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Failed", description: `\`${err.message}\`` }],
      });
    }
  },
};
