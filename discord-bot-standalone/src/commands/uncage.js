const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uncage")
    .setDescription("Release a member from the cage")
    .addUserOption((o) => o.setName("member").setDescription("Member to release").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }] });

    const jailRoleName = process.env.JAIL_ROLE_NAME || "Caged";
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName.toLowerCase()
    );

    if (!jailRole || !target.roles.cache.has(jailRole.id)) return interaction.editReply({ embeds: [{ color: 0xff8c00, description: `⚠️ <@${target.id}> is not caged.` }] });

    try {
      await target.roles.remove(jailRole, reason);
      await sendLog(interaction.client, buildLog({ action: "UNCAGE", moderator: interaction.user, target: target.user, reason }));
      await interaction.editReply({
        embeds: [{
          color: 0x00cc66, title: "🔓 Member Released",
          description: `<@${target.id}> has been released from the cage.`,
          fields: [{ name: "Reason", value: reason }],
          footer: { text: `By ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Something went wrong. Check bot logs." }] });
      console.error(err);
    }
  },
};
