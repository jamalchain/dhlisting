const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildCageLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cage")
    .setDescription("Put a member in the cage (assigns jail role, keeps their other roles)")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to cage").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for caging").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }] });
    }

    if (!target.manageable) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, description: "❌ I cannot manage this member. They may have a higher role than me." }],
      });
    }

    const jailRoleName = process.env.JAIL_ROLE_NAME || "Caged";
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName.toLowerCase()
    );

    if (!jailRole) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff4444,
            description: `❌ Jail role **"${jailRoleName}"** not found. Create it in your server and make sure the name matches \`JAIL_ROLE_NAME\` in your env.`,
          },
        ],
      });
    }

    if (target.roles.cache.has(jailRole.id)) {
      return interaction.editReply({
        embeds: [{ color: 0xff8c00, description: `⚠️ <@${target.id}> is already caged.` }],
      });
    }

    try {
      await target.roles.add(jailRole, reason);

      const logEmbed = buildCageLog({
        action: "CAGE",
        moderator: interaction.user,
        target: target.user,
        reason,
      });

      await sendLog(interaction.client, logEmbed);

      await interaction.editReply({
        embeds: [
          {
            color: 0xff8c00,
            title: "🔒 Member Caged",
            description: `<@${target.id}> has been put in the cage.`,
            fields: [{ name: "Reason", value: reason }],
            footer: { text: `By ${interaction.user.tag}` },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [{ color: 0xff4444, description: `❌ Failed: \`${err.message}\`` }] });
    }
  },
};
