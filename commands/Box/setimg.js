import axios from "axios";
import fs from "fs";
class setimg {
  name = "setimg";
  author = "Kaguya Project";
  cooldowns = 60;
  descriptions = "Thay avatar box";
  role = "admin";
  aliases = [""];

  async execute({ api, event, args }) {
    try {
      if (event.type !== "message_reply") return api.sendMessage("❌ Bạn phải reply một ảnh nào đó", event.threadID);
      if (event.messageReply.attachments.length !== 1) return api.sendMessage("❌ Vui lòng reply chỉ một ảnh!", event.threadID);

      var avatar = (await axios.get(event.messageReply.attachments[0].url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(`./cache/${event.senderID}_${event.threadID}.png`, Buffer.from(avatar));
      return api.changeGroupImage(fs.createReadStream(`./cache/${event.senderID}_${event.threadID}.png`), event.threadID, () => {
        fs.unlinkSync(`./cache/${event.senderID}_${event.threadID}.png`);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new setimg();
