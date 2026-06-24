const { GuildMember } = require("discord.js");

/**
 * Check if a member is authorized to use bot commands.
 * Authorized = Discord guild owner OR env-listed owner IDs OR whitelist role.
 */
function isAuthorized(member) {
  // Always allow the actual Discord server owner (works even if env is misconfigured)
  if (member.guild && member.id === member.guild.ownerId) return true;

  const ownerIds = (process.env.OWNER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ownerIds.includes(member.id)) return true;

  const whitelistRoleName = process.env.WHITELIST_ROLE_NAME || "Bot Access";
  return member.roles.cache.some(
    (r) => r.name.toLowerCase() === whitelistRoleName.toLowerCase()
  );
}

/**
 * Send a consistent "no permission" reply.
 */
async function denyAccess(interaction) {
  return interaction.reply({
    embeds: [
      {
        color: 0xff4444,
        description:
          "🚫 **Access Denied** — You need to be an owner or have the whitelist role to use this command.",
      },
    ],
    ephemeral: true,
  });
}

module.exports = { isAuthorized, denyAccess };
