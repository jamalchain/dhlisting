const { EmbedBuilder } = require("discord.js");

async function sendLog(client, embed) {
  const id = process.env.LOG_CHANNEL_ID;
  if (!id) return;
  try {
    const ch = await client.channels.fetch(id);
    if (ch && ch.isTextBased()) await ch.send({ embeds: [embed] });
  } catch (e) {
    console.error("Log send failed:", e.message);
  }
}

function buildLog({ action, moderator, target, reason, strippedRoles }) {
  const colors = { CAGE: 0xff8c00, STRIP: 0xff2222, UNCAGE: 0x00cc66 };
  const icons = { CAGE: "🔒", STRIP: "⚡", UNCAGE: "🔓" };

  const embed = new EmbedBuilder()
    .setColor(colors[action] ?? 0x888888)
    .setTitle(`${icons[action] ?? "📋"} ${action}`)
    .addFields(
      { name: "Target", value: `<@${target.id}> \`${target.tag}\``, inline: true },
      { name: "Moderator", value: `<@${moderator.id}> \`${moderator.tag}\``, inline: true },
      { name: "Reason", value: reason || "No reason provided" }
    )
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  if (strippedRoles && strippedRoles.length > 0) {
    embed.addFields({
      name: `Stripped Roles (${strippedRoles.length})`,
      value: strippedRoles.map((r) => `<@&${r.id}>`).join(" ") || "None",
    });
  }

  return embed;
}

module.exports = { sendLog, buildLog };
