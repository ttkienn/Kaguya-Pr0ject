export default {
    name: "changebio",
    author: "Kaguya Project",
    role: "owner",
    cooldowns: 10,
    description: "Đổi tiểu sử của bot",
    async execute({ api, args }) {
      try {
        var content = args.join(" ") || "";
        await api.changeBio(content);
        return kaguya.reply(`Đã đổi tiểu sử của bot thành : ${content}`)
      } catch (err) {
        console.error(err);
      }
    },
  };
  