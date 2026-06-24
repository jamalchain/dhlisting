const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildCageLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strip")
    .setDescription("⚡ Strip ALL roles from a member and instantly cage them")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to strip & cage").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }] });
    }

    if (!target.manageable) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, description: "❌ I cannot manage this member. They may have a higher role than me." }],
      });
    }

    const jailRoleName = process.env.JAIL_ROLE_NAME || "Caged";
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName.toLowerCase()
    );

    if (!jailRole) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff4444,
            description: `❌ Jail role **"${jailRoleName}"** not found. Create it in your server and set \`JAIL_ROLE_NAME\` in your env.`,
          },
        ],
      });
    }

    // Collect removable roles: exclude @everyone, the jail role itself,
    // roles above or equal to the bot's highest role, and Discord-managed
    // roles (integration/boost roles that cannot be manually removed).
    const botMember = interaction.guild.members.me;
    const rolesToStrip = target.roles.cache.filter(
      (r) =>
        r.id !== interaction.guild.id &&                        // not @everyone
        r.id !== jailRole.id &&                                 // not jail role
        !r.managed &&                                           // not a bot/integration managed role
        r.position < botMember.roles.highest.position          // bot can manage it
    );

    // Roles the bot cannot touch (log them but don't fail the command)
    const skippedRoles = target.roles.cache.filter(
      (r) =>
        r.id !== interaction.guild.id &&
        r.id !== jailRole.id &&
        (r.managed || r.position >= botMember.roles.highest.position)
    );

    try {
      // Remove each strippable role individually so a single failure
      // doesn't abort the entire operation.
      for (const role of rolesToStrip.values()) {
        await target.roles.remove(role, reason).catch((err) => {
          console.error(`[Strip] Could not remove role ${role.name}: ${err.message}`);
        });
      }
      // Add jail role if not already present
      if (!target.roles.cache.has(jailRole.id)) {
        await target.roles.add(jailRole, reason);
      }

      const logEmbed = buildCageLog({
        action: "STRIP",
        moderator: interaction.user,
        target: target.user,
        reason,
        strippedRoles: [...rolesToStrip.values()],
      });

      await sendLog(interaction.client, logEmbed);

      const strippedList =
        rolesToStrip.size > 0
          ? [...rolesToStrip.values()].map((r) => `<@&${r.id}>`).join(" ")
          : "None";

      const fields = [
        { name: `Stripped Roles (${rolesToStrip.size})`, value: strippedList, inline: false },
        { name: "Reason", value: reason, inline: false },
      ];

      if (skippedRoles.size > 0) {
        fields.push({
          name: `Skipped Roles (${skippedRoles.size}) — bot cannot remove`,
          value: [...skippedRoles.values()].map((r) => `<@&${r.id}>`).join(" "),
          inline: false,
        });
      }

      await interaction.editReply({
        embeds: [
          {
            color: 0xff2222,
            title: "⚡ Member Stripped & Caged",
            description: `<@${target.id}> has had all manageable roles removed and is now caged.`,
            fields,
            footer: { text: `By ${interaction.user.tag}` },
            thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (err) {
      console.error(`[Strip] Unexpected error:`, err);
      await interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ An unexpected error occurred. Check bot logs." }] });
    }
  },
};
