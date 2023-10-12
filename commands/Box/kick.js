class Kick {
  name = "kick";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "Kick người dùng ra khỏi nhóm!";
  role = "admin";
  aliases = [""];

  async execute({ api, event, Threads }) {
    try {
        const mentions = Object.keys(event.mentions);
        const threadData = (await Threads.find(event.threadID))?.data?.data;

      if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
        return kaguya.reply("Bot chưa có quyền quản trị viên nhóm nên không thể kick");
      }

      if (!mentions[0]) {
        return kaguya.reply("Bạn cần phải tag người cần kick!");
      }

      await Promise.all(
        mentions.map(async (id) => {
          try {
            await api.removeUserFromGroup(id, event.threadID);
          } catch (err) {
            console.error(err);
          }
        })
      );
    } catch (err) {
      console.error(err);
      return kaguya.reply("Đã xảy ra lỗi ngoài ý muốn!");
    }
  }
}

export default new Kick();
