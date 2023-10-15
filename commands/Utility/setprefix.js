import jimp from "jimp"
export default {
  name: "setprefix",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "Lấy UID của người dùng",
  role: "member",
  aliases: ["prefix"],
  execute: async ({ event, Threads, args }) => {
    if (!event.isGroup) {
      return kaguya.reply("Lệnh này chỉ có thể sử dụng trong nhóm!");
    }

    const getThread = await Threads.find(event.threadID);

    const responses = {
      true: () => {
        if (args[0]) {
          Threads.update(event.threadID, { prefix: args[0] }).then(() => {
            kaguya.reply("Đã đổi prefix nhóm của bạn sang : " + args[0]);
          });
        } else {
          kaguya.reply(`Prefix hiện tại của nhóm bạn là : ${getThread.data?.data?.prefix || client.config.prefix}`);
        }
      },
      false: () => kaguya.reply("Không tìm thấy thông tin nhóm bạn trong database"),
    };

    responses[getThread?.status || false]();
  },
};
