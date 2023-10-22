class Afk {
  name = "afk";
  author = "Kaguya Project";
  cooldowns = 10;
  description = "Set AFK status. When someone mentions you, the bot will reply that you are AFK.";
  role = "member";
  dataUser = {}
  lang = {
    "vi_VN": {
      "afk": "Đã đặt trạng thái afk với lý do: $1",
      "afk_reply": "Người dùng $1 đang afk với lý do: $2",
      "afk_clear": "Chào mừng quay trở lại, những người đã tag bạn khi bạn afk:\n\n$1"
    },
    "en_US": {
      "afk": "Has set afk status with reason: $1",
      "afk_reply": "User $1 is afk with reason: $2",
      "afk_clear": "Welcome back, the people who tagged you when you were afk:\n\n$1"
    }
  }
  async execute({ api, event, args, Users }) {
    var reason = args.join(" ") || client.config.language == "vi_VN" ? "Không có lý do" : "No reason";
    try {

      var nameUser = (await Users.find(event.senderID))?.data?.data?.name || event.senderID;
      this.dataUser[event.senderID] = { reason, nameUser, tag: [] };
      return api.sendMessage(getLang("plugins.afk.afk", reason), event.threadID, event.messageID);
      
    } catch (err) {
      console.log(err)
    }
  }
  async events({ event, api }) {
    try {

      if (event.senderID in this.dataUser) {
        return api.sendMessage(getLang("plugins.afk.afk_clear", this.dataUser[event.senderID].tag.join(`\n` + '-'.repeat(30) + "\n")), event.threadID, () => {
          delete this.dataUser[event.senderID];
        }, event.messageID);
      }

      if (!event.mentions) return;

      for (let id of Object.keys(event.mentions)) {
        if (id in this.dataUser) {
          this.dataUser[id].tag.push(`UID: ${event.senderID}\nNội dung: ${event.body}\nThời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);
          api.sendMessage(getLang("plugins.afk.afk_reply", this.dataUser[id].nameUser, this.dataUser[id].reason), event.threadID, event.messageID);
        }
      }

    } catch (err) {
      console.log(err)
    }
  }
}

export default new Afk();
