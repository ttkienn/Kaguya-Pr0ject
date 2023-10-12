export default {
  name: "unsend",
  author: "Kaguya Project",
  cooldowns: 10,
  description: "Gỡ tin nhắn của bot",
  role: "member",
  aliases: ["gỡ"],
  execute: async ({ api, event }) => {
    if (event?.messageReply?.senderID != api.getCurrentUserID()) {
      return kaguya.reply("Không thể gỡ tin nhắn của người khác!");
    }

    return kaguya.unsend(event.messageReply.messageID, (err) => {
      if (err) {
        return kaguya.reply("Đã xảy ra lỗi, vui lòng thử lại sau!");
      }
    });
  },
  events: async ({ api, event }) => {
    var reaction = ["😢"];
    if (event.reaction && event.senderID == api.getCurrentUserID() && reaction.includes(event.reaction)) {
      kaguya.unsend(event.messageID);
    }
  },
};
