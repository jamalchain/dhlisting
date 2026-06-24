const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

const NAMED_COLORS = {
  red: 0xff4444, green: 0x00cc66, blue: 0x4488ff,
  gold: 0xffd700, purple: 0x9b59b6, orange: 0xff8c00,
  pink: 0xff69b4, white: 0xffffff, black: 0x23272a,
  cyan: 0x00ffff, yellow: 0xffff00, blurple: 0x5865f2,
};

function resolveColor(input) {
  if (!input) return 0x5865f2;
  const lower = input.toLowerCase().trim();
  if (NAMED_COLORS[lower] !== undefined) return NAMED_COLORS[lower];
  if (/^#?[0-9a-f]{6}$/i.test(lower)) return parseInt(lower.replace("#", ""), 16);
  return 0x5865f2;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot send a styled embed message")
    .addStringOption((o) =>
      o.setName("message").setDescription("The message content").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("channel")
        .setDescription("Channel to send in (defaults to here)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("title").setDescription("Optional embed title").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("color")
        .setDescription("Color name (red, gold, purple…) or hex (#ff0000)")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const message  = interaction.options.getString("message");
    const title    = interaction.options.getString("title");
    const channel  = interaction.options.getChannel("channel") ?? interaction.channel;
    const color    = resolveColor(interaction.options.getString("color"));

    const embed = new EmbedBuilder()
      .setDescription(message)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: "DH Listing Bot" });

    if (title) embed.setTitle(title);

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        embeds: [{
          color: 0x00cc66,
          description: `✅ Message sent in <#${channel.id}>`,
          footer: { text: "DH Listing Bot" },
        }],
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [{
          color: 0xff4444,
          title: "❌ Failed to Send",
          description: `\`${err.message}\``,
          footer: { text: "DH Listing Bot" },
        }],
        ephemeral: true,
      });
    }
  },
};
