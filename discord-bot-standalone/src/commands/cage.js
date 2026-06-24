const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cage")
    .setDescription("Put a member in the cage (assigns the jail role)")
    .addUserOption((o) =>
      o.setName("member").setDescription("Member to cage").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for caging").setRequired(false)
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

    if (!target.manageable) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Cannot Cage", description: "I can't manage this member — they may have a higher role than me." }],
      });
    }

    const jailRoleName = (process.env.JAIL_ROLE_NAME || "Caged").toLowerCase();
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName
    );

    if (!jailRole) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Role Not Found", description: `Create a role named **"${process.env.JAIL_ROLE_NAME || "Caged"}"** in your server first.` }],
      });
    }

    if (target.roles.cache.has(jailRole.id)) {
      return interaction.editReply({
        embeds: [{ color: 0xff8c00, title: "⚠️ Already Caged", description: `<@${target.id}> is already in the cage.` }],
      });
    }

    try {
      await target.roles.add(jailRole, reason);

      await sendLog(
        interaction.client,
        buildLog({ action: "CAGE", moderator: interaction.user, target: target.user, reason })
      );

      await interaction.editReply({
        embeds: [{
          color: 0xff8c00,
          title: "🔒 Member Caged",
          description: `<@${target.id}> has been put in the cage.`,
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
