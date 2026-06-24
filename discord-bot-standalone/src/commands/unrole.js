const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unrole")
    .setDescription("Remove a role from a member")
    .addUserOption((o) =>
      o.setName("member").setDescription("Target member").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Role to remove").setRequired(true)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const role   = interaction.options.getRole("role");

    if (!target) {
      return interaction.reply({
        embeds: [{ color: 0xff4444, title: "❌ Error", description: "Member not found in this server." }],
        ephemeral: true,
      });
    }

    if (!target.roles.cache.has(role.id)) {
      return interaction.reply({
        embeds: [{ color: 0xff8c00, title: "⚠️ Role Not Found", description: `<@${target.id}> doesn't have <@&${role.id}>.` }],
        ephemeral: true,
      });
    }

    try {
      await target.roles.remove(role);
      await interaction.reply({
        embeds: [{
          color: 0xff8c00,
          title: "🔻 Role Removed",
          description: `Removed <@&${role.id}> from <@${target.id}>`,
          fields: [
            { name: "Member",    value: `<@${target.id}> · \`${target.user.username}\``,            inline: true },
            { name: "Role",      value: `<@&${role.id}> · \`${role.name}\``,                        inline: true },
            { name: "Moderator", value: `<@${interaction.user.id}> · \`${interaction.user.username}\``, inline: false },
          ],
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
