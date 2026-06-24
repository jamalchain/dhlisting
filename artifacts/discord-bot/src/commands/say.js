const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot send a message in a channel")
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("What should the bot say?")
        .setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel to send the message in (defaults to current)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("title")
        .setDescription("Optional embed title")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("color")
        .setDescription("Embed color (hex, e.g. #ff0000) or preset: red, green, blue, gold, purple")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    const message = interaction.options.getString("message");
    const title = interaction.options.getString("title");
    const targetChannel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    const colorInput = (interaction.options.getString("color") ?? "").toLowerCase();

    const colorMap = {
      red: 0xff4444,
      green: 0x00cc66,
      blue: 0x4488ff,
      gold: 0xffd700,
      purple: 0x9b59b6,
      orange: 0xff8c00,
      pink: 0xff69b4,
      white: 0xffffff,
      black: 0x23272a,
    };

    let resolvedColor = 0x5865f2; // Discord blurple default
    if (colorInput) {
      if (colorMap[colorInput] !== undefined) {
        resolvedColor = colorMap[colorInput];
      } else if (/^#?[0-9a-f]{6}$/i.test(colorInput)) {
        resolvedColor = parseInt(colorInput.replace("#", ""), 16);
      }
    }

    const embed = new EmbedBuilder()
      .setDescription(message)
      .setColor(resolvedColor)
      .setTimestamp();

    if (title) embed.setTitle(title);

    try {
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({
        embeds: [
          {
            color: 0x00cc66,
            description: `✅ Message sent in <#${targetChannel.id}>`,
          },
        ],
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [
          {
            color: 0xff4444,
            description: `❌ Could not send message: \`${err.message}\``,
          },
        ],
        ephemeral: true,
      });
    }
  },
};
