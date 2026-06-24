const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption((o) =>
      o.setName("member").setDescription("Member to kick").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for kick").setRequired(false)
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

    if (!target.kickable) {
      return interaction.reply({
        embeds: [{ color: 0xff4444, title: "❌ Cannot Kick", description: "I can't kick this member — they may have a higher role than me." }],
        ephemeral: true,
      });
    }

    // DM the user before kicking
    await target.send({
      embeds: [{
        color: 0xff4444,
        title: "👢 You Were Kicked",
        fields: [
          { name: "Server", value: interaction.guild.name, inline: true },
          { name: "Reason", value: reason },
        ],
        footer: { text: "DH Listing Bot" },
        timestamp: new Date().toISOString(),
      }],
    }).catch(() => {}); // ignore if DMs are closed

    try {
      await target.kick(reason);
      await interaction.reply({
        embeds: [{
          color: 0xff4444,
          title: "👢 Member Kicked",
          description: `**${target.user.username}** has been removed from the server.`,
          fields: [
            { name: "Reason",    value: reason },
            { name: "Moderator", value: `<@${interaction.user.id}> · \`${interaction.user.username}\`` },
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
