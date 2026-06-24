const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

const COLORS = {
  red: 0xff4444, green: 0x00cc66, blue: 0x4488ff,
  gold: 0xffd700, purple: 0x9b59b6, orange: 0xff8c00,
  pink: 0xff69b4, white: 0xffffff, black: 0x23272a,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot send a message")
    .addStringOption((o) =>
      o.setName("message").setDescription("Message content").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Channel to send in (default: here)").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("title").setDescription("Embed title").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("color")
        .setDescription("Color name or hex (e.g. red, #ff0000)")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const message = interaction.options.getString("message");
    const title = interaction.options.getString("title");
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;
    const colorInput = (interaction.options.getString("color") ?? "").toLowerCase().trim();

    let color = 0x5865f2;
    if (colorInput) {
      if (COLORS[colorInput] !== undefined) color = COLORS[colorInput];
      else if (/^#?[0-9a-f]{6}$/i.test(colorInput))
        color = parseInt(colorInput.replace("#", ""), 16);
    }

    const embed = new EmbedBuilder().setDescription(message).setColor(color).setTimestamp();
    if (title) embed.setTitle(title);

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        embeds: [{ color: 0x00cc66, description: `✅ Sent in <#${channel.id}>` }],
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [{ color: 0xff4444, description: `❌ Failed to send: \`${err.message}\`` }],
        ephemeral: true,
      });
    }
  },
};
