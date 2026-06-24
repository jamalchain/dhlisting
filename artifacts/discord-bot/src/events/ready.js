const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: "discord.gg/dhlisting", type: 3 }], // WATCHING
      status: "online",
    });
  },
};
