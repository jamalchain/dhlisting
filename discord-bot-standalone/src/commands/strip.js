const { SlashCommandBuilder } = require("discord.js");
const { isAuthorized, denyAccess } = require("../utils/permissions");
const { sendLog, buildLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strip")
    .setDescription("⚡ Strip ALL roles from a member and instantly cage them")
    .addUserOption((o) => o.setName("member").setDescription("Member to strip & cage").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    if (!isAuthorized(interaction.member)) return denyAccess(interaction);

    await interaction.deferReply();

    const target = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Member not found." }] });
    if (!target.manageable) return interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ I can't manage this member — they may outrank me." }] });

    const jailRoleName = process.env.JAIL_ROLE_NAME || "Caged";
    const jailRole = interaction.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === jailRoleName.toLowerCase()
    );

    if (!jailRole) return interaction.editReply({ embeds: [{ color: 0xff4444, description: `❌ Role **"${jailRoleName}"** not found. Create it in your server.` }] });

    const botHighest = interaction.guild.members.me.roles.highest.position;

    // Roles we can actually remove
    const removable = target.roles.cache.filter(
      (r) => r.id !== interaction.guild.id && r.id !== jailRole.id && !r.managed && r.position < botHighest
    );

    // Roles we can't touch (managed / higher than bot)
    const skipped = target.roles.cache.filter(
      (r) => r.id !== interaction.guild.id && r.id !== jailRole.id && (r.managed || r.position >= botHighest)
    );

    try {
      // Remove each role individually — partial success is fine
      for (const role of removable.values()) {
        await target.roles.remove(role, reason).catch((e) =>
          console.error(`Could not remove role ${role.name}: ${e.message}`)
        );
      }

      // Add jail role if not already there
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

      const strippedText = removable.size > 0 ? [...removable.values()].map((r) => `<@&${r.id}>`).join(" ") : "None";
      const skippedText = skipped.size > 0 ? [...skipped.values()].map((r) => `<@&${r.id}>`).join(" ") : null;

      const fields = [
        { name: `Stripped (${removable.size})`, value: strippedText },
        { name: "Reason", value: reason },
      ];
      if (skippedText) fields.push({ name: `Skipped — bot can't remove (${skipped.size})`, value: skippedText });

      await interaction.editReply({
        embeds: [{
          color: 0xff2222,
          title: "⚡ Stripped & Caged",
          description: `<@${target.id}> has been stripped and caged.`,
          fields,
          thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
          footer: { text: `By ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [{ color: 0xff4444, description: "❌ Something went wrong. Check bot logs." }] });
    }
  },
};
