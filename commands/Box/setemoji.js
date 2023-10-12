import fs from "fs";
const emojiJSON = JSON.parse(fs.readFileSync("./cache/emoji/emoji.json", "utf-8"));

class setimg {
  name = "setemoji";
  author = "Kaguya Project";
  cooldowns = 60;
  descriptions = "Thay icon box";
  role = "admin";
  aliases = [];

  async execute({ api, event, args }) {
    try {
      var [emoji] = args;
      if (!emojiJSON.includes(emoji)) {
        return kaguya.reply("Vui lòng nhập emoji hợp lệ !")
      }
      await api.changeThreadEmoji(emoji, event.threadID, event.messagaID);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new setimg();
