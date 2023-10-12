export default {
  name: "uptime",
  author: "Kaguya Project",
  cooldowns: 60,
  description: "Xem uptime của bot!",
  role: "member",
  aliases: ["upt"],
  execute: async ({ args }) => {
    const t = process.uptime();
    const [hours, minutes, seconds] = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)].map((num) => (num < 10 ? "0" + num : num));
    return kaguya.reply(`${hours}:${minutes}:${seconds}`);
  },
};
