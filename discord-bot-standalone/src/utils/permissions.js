function isAuthorized(member) {
  // Always allow the actual Discord server owner
  if (member.guild && member.id === member.guild.ownerId) return true;

  // Allow anyone listed in OWNER_IDS env
  const ownerIds = (process.env.OWNER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ownerIds.includes(member.id)) return true;

  // Allow the whitelist role
  const whitelistRole = process.env.WHITELIST_ROLE_NAME || "Bot Access";
  return member.roles.cache.some(
    (r) => r.name.toLowerCase() === whitelistRole.toLowerCase()
  );
}

async function denyAccess(interaction) {
  return interaction.reply({
    embeds: [
      {
        color: 0xff4444,
        description:
          "🚫 **Access Denied** — You need to be an owner or have the whitelist role.",
      },
    ],
    ephemeral: true,
  });
}

module.exports = { isAuthorized, denyAccess };
