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
  const config = {
    CAGE:   { color: 0xff8c00, icon: "🔒" },
    UNCAGE: { color: 0x00cc66, icon: "🔓" },
    STRIP:  { color: 0xff2222, icon: "⚡" },
  };

  const { color, icon } = config[action] ?? { color: 0x888888, icon: "📋" };

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${icon} ${action}`)
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "Target",     value: `<@${target.id}> · \`${target.username}\``,    inline: true },
      { name: "Moderator",  value: `<@${moderator.id}> · \`${moderator.username}\``, inline: true },
      { name: "Reason",     value: reason || "No reason provided" }
    )
    .setFooter({ text: "DH Listing Bot" })
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
