function isAuthorized(member) {
  // Server owner always has access
  if (member.guild && member.id === member.guild.ownerId) return true;

  // Anyone listed in OWNER_IDS env var
  const ownerIds = (process.env.OWNER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ownerIds.includes(member.id)) return true;

  // Anyone with the whitelist role
  const whitelistRole = (process.env.WHITELIST_ROLE_NAME || "Bot Access").toLowerCase();
  return member.roles.cache.some((r) => r.name.toLowerCase() === whitelistRole);
}

async function denyAccess(interaction) {
  return interaction.reply({
    embeds: [
      {
        color: 0xff4444,
        title: "🚫 Access Denied",
        description: "You need to be an owner or have the **Bot Access** role to use this command.",
        footer: { text: "DH Listing Bot" },
      },
    ],
    ephemeral: true,
  });
}

module.exports = { isAuthorized, denyAccess };
