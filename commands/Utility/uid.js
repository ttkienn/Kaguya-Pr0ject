export default {
  name: "uid",
  author: "Thiệu Trung Kiên",
  cooldowns: 10,
  description: "Lấy UID của người dùng",
  role: "member",
  aliases: ["getuid"],
  execute: async ({ event }) => {
    const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);

    if (!uid) {
      return kaguya.reply("Vui lòng tag hoặc reply tin nhắn người bạn cần lấy UID");
    }

    return kaguya.reply(uid);
  }
};
