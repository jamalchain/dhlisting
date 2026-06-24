const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

const DURATIONS = {
  "60s": 60, "5m": 300, "10m": 600, "30m": 1800,
  "1h": 3600, "6h": 21600, "12h": 43200,
  "1d": 86400, "3d": 259200, "7d": 604800,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member")
    .addUserOption((o) => o.setName("member").setDescription("Member to mute").setRequired(true))
    .addStringOption((o) =>
      o.setName("duration").setDescription("How long").setRequired(true)
        .addChoices(
          { name: "60 seconds", value: "60s" }, { name: "5 minutes", value: "5m" },
          { name: "10 minutes", value: "10m" }, { name: "30 minutes", value: "30m" },
          { name: "1 hour", value: "1h" }, { name: "6 hours", value: "6h" },
          { name: "12 hours", value: "12h" }, { name: "1 day", value: "1d" },
          { name: "3 days", value: "3d" }, { name: "7 days", value: "7d" }
        )
    )
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const durKey = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const seconds = DURATIONS[durKey] ?? 300;

    if (!target) return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    if (!target.moderatable) return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ I can't mute this member — they may outrank me." }], ephemeral: true });

    try {
      await target.timeout(seconds * 1000, reason);
      const until = Math.floor((Date.now() + seconds * 1000) / 1000);
      await interaction.reply({
        embeds: [{
          color: 0xff8c00, title: "🔇 Member Muted",
          description: `<@${target.id}> has been timed out.`,
          fields: [
            { name: "Duration", value: durKey, inline: true },
            { name: "Expires", value: `<t:${until}:R>`, inline: true },
            { name: "Reason", value: reason },
          ],
          footer: { text: `By ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      await interaction.reply({ embeds: [{ color: 0xff4444, description: `❌ Failed: \`${err.message}\`` }], ephemeral: true });
    }
  },
};
