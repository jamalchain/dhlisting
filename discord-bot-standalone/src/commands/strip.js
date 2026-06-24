const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strip")
    .setDescription("⚡ Strip ALL roles from a member and instantly cage them")
    .addUserOption((o) =>
      o.setName("member").setDescription("Member to strip & cage").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason").setRequired(false)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Error", description: "Member not found in this server." }],
      });
    }

    if (!target.manageable) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Cannot Strip", description: "I can't manage this member — they may have a higher role than me." }],
      });
    }

    const jailRoleName = (process.env.JAIL_ROLE_NAME || "Caged").toLowerCase();
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName
    );

    if (!jailRole) {
      return interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Role Not Found", description: `Create a role named **"${process.env.JAIL_ROLE_NAME || "Caged"}"** in your server first.` }],
      });
    }

    const botHighest = interaction.guild.members.me.roles.highest.position;

    // Roles we can remove (not @everyone, not jail role, not managed by integrations, below bot)
    const removable = target.roles.cache.filter(
      (r) =>
        r.id !== interaction.guild.id &&
        r.id !== jailRole.id &&
        !r.managed &&
        r.position < botHighest
    );

    // Roles we can't touch (integration-managed or above bot's highest role)
    const skipped = target.roles.cache.filter(
      (r) =>
        r.id !== interaction.guild.id &&
        r.id !== jailRole.id &&
        (r.managed || r.position >= botHighest)
    );

    try {
      // Remove roles one by one — partial success is fine
      for (const role of removable.values()) {
        await target.roles
          .remove(role, reason)
          .catch((e) => console.error(`Could not remove role "${role.name}": ${e.message}`));
      }

      // Cage if not already
      if (!target.roles.cache.has(jailRole.id)) {
        await target.roles.add(jailRole, reason);
      }

      await sendLog(
        interaction.client,
        buildLog({
          action: "STRIP",
          moderator: interaction.user,
          target: target.user,
          reason,
          strippedRoles: [...removable.values()],
        })
      );

      const strippedList = removable.size > 0
        ? [...removable.values()].map((r) => `<@&${r.id}>`).join(" ")
        : "None";
      const skippedList = skipped.size > 0
        ? [...skipped.values()].map((r) => `<@&${r.id}>`).join(" ")
        : null;

      const fields = [
        { name: `🗑️ Stripped (${removable.size})`, value: strippedList },
        { name: "Reason",    value: reason },
        { name: "Moderator", value: `<@${interaction.user.id}> · \`${interaction.user.username}\`` },
      ];

      if (skippedList) {
        fields.push({ name: `⚠️ Skipped — bot can't remove (${skipped.size})`, value: skippedList });
      }

      await interaction.editReply({
        embeds: [{
          color: 0xff2222,
          title: "⚡ Stripped & Caged",
          description: `<@${target.id}> has been fully stripped and caged.`,
          fields,
          thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
          footer: { text: "DH Listing Bot" },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [{ color: 0xff4444, title: "❌ Failed", description: `\`${err.message}\`` }],
      });
    }
  },
};
