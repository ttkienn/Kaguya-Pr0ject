import nodeCron from "node-cron"
export default {
  name: "autorestart",
  author: "Kaguya Project",
  role: "owner",
  cooldowns: 10,
  description: "Tự động restart lại sau khoảng thời gian được thiết lập !",
  aliases: [],
  onLoad() {
    var minutes = global.client.config.autoRestart;
    nodeCron.schedule(`*/${minutes} * * * *`, () => {
      process.exit(1)
    });
  },
  execute() {}
};
