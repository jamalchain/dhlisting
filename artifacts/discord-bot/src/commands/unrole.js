const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unrole")
    .setDescription("Remove a role from a member")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Target member").setRequired(true)
    )
    .addRoleOption((opt) =>
      opt.setName("role").setDescription("Role to remove").setRequired(true)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const role = interaction.options.getRole("role");

    if (!target) {
      return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    }

    if (!target.roles.cache.has(role.id)) {
      return interaction.reply({
        embeds: [{ color: 0xff8c00, description: `⚠️ <@${target.id}> doesn't have <@&${role.id}>.` }],
        ephemeral: true,
      });
    }

    try {
      await target.roles.remove(role);
      await interaction.reply({
        embeds: [
          {
            color: 0xff8c00,
            title: "🔻 Role Removed",
            description: `Removed <@&${role.id}> from <@${target.id}>`,
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
