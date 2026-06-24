const { EmbedBuilder } = require("discord.js");

/**
 * Send a log embed to the configured log channel.
 */
async function sendLog(client, embed) {
  const logChannelId = process.env.LOG_CHANNEL_ID;
  if (!logChannelId) return;

  try {
    const channel = await client.channels.fetch(logChannelId);
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error("[Logger] Failed to send log:", err.message);
  }
}

/**
 * Build a cage/strip log embed.
 */
function buildCageLog({ action, moderator, target, reason, strippedRoles }) {
  const colors = {
    CAGE: 0xff8c00,
    STRIP: 0xff2222,
    UNCAGE: 0x00cc66,
  };

  const icons = {
    CAGE: "🔒",
    STRIP: "⚡",
    UNCAGE: "🔓",
  };

  const embed = new EmbedBuilder()
    .setColor(colors[action] ?? 0x888888)
    .setTitle(`${icons[action] ?? "📋"} ${action} — Moderation Log`)
    .addFields(
      { name: "Target", value: `<@${target.id}> \`${target.tag}\``, inline: true },
      { name: "Moderator", value: `<@${moderator.id}> \`${moderator.tag}\``, inline: true },
      { name: "Reason", value: reason || "No reason provided", inline: false }
    )
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  if (strippedRoles && strippedRoles.length > 0) {
    embed.addFields({
      name: `Stripped Roles (${strippedRoles.length})`,
      value: strippedRoles.map((r) => `<@&${r.id}>`).join(" ") || "None",
      inline: false,
    });
  }

  return embed;
}

module.exports = { sendLog, buildCageLog };
