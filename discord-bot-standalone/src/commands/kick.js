const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption((o) => o.setName("member").setDescription("Member to kick").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    if (!target.kickable) return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ I can't kick this member — they may outrank me." }], ephemeral: true });

    try {
      await target.send({ embeds: [{ color: 0xff4444, title: "👢 You were kicked", fields: [{ name: "Server", value: interaction.guild.name, inline: true }, { name: "Reason", value: reason }], timestamp: new Date().toISOString() }] }).catch(() => {});
      await target.kick(reason);
      await interaction.reply({
        embeds: [{
          color: 0xff4444, title: "👢 Member Kicked",
          description: `**${target.user.tag}** has been kicked.`,
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
