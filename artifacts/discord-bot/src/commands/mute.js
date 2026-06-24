const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

const DURATION_MAP = {
  "60s": 60,
  "5m": 300,
  "10m": 600,
  "30m": 1800,
  "1h": 3600,
  "6h": 21600,
  "12h": 43200,
  "1d": 86400,
  "3d": 259200,
  "7d": 604800,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to mute").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("duration")
        .setDescription("Mute duration")
        .setRequired(true)
        .addChoices(
          { name: "60 seconds", value: "60s" },
          { name: "5 minutes", value: "5m" },
          { name: "10 minutes", value: "10m" },
          { name: "30 minutes", value: "30m" },
          { name: "1 hour", value: "1h" },
          { name: "6 hours", value: "6h" },
          { name: "12 hours", value: "12h" },
          { name: "1 day", value: "1d" },
          { name: "3 days", value: "3d" },
          { name: "7 days", value: "7d" }
        )
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for mute").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const target = interaction.options.getMember("member");
    const durationKey = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const seconds = DURATION_MAP[durationKey] ?? 300;

    if (!target) {
      return interaction.reply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }], ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({
        embeds: [{ color: 0xff4444, description: "❌ I cannot mute this member. They may have a higher role than me." }],
        ephemeral: true,
      });
    }

    try {
      await target.timeout(seconds * 1000, reason);

      const until = new Date(Date.now() + seconds * 1000);

      await interaction.reply({
        embeds: [
          {
            color: 0xff8c00,
            title: "🔇 Member Muted",
            description: `<@${target.id}> has been timed out.`,
            fields: [
              { name: "Duration", value: durationKey, inline: true },
              { name: "Expires", value: `<t:${Math.floor(until.getTime() / 1000)}:R>`, inline: true },
              { name: "Reason", value: reason, inline: false },
            ],
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
