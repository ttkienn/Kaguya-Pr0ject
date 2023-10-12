export default {
  name: "coins",
  author: "Thiệu Trung Kiên",
  cooldowns: 5,
  description: "Quản lý coins trong tài khoản!",
  role: "member",
  aliases: ["money", "economy"],
  async execute({ event, Economy, args }) {
    try {
      const [action, amount] = args;

      if (["add", "remove"].includes(action) && !global.client.config.ADMIN_IDS.includes(event.senderID)) {
        return kaguya.reply("Bạn không có quyền để sử dụng lệnh này");
      }

      const actions = {
        add: Economy.increase,
        remove: Economy.decrease,
        pay: Economy.pay,
        default: async () => {
          const balance = await Economy.getBalance(event.senderID);
          return kaguya.reply(`Số coins hiện tại của bạn là: ${balance.data}\n\n${global.client.config.ADMIN_IDS.includes(event.senderID) ? `[Vì bạn là admin nên sẽ thấy tin nhắn này]\n!coins add <số_coins> <@tag> để thêm coins cho người dùng\n!coins remove <số_coins> <@tag> để trừ số coins của người dùng` : ""}`);
        },
      };

      const actionFunction = actions[action] || actions["default"];
      const result = await actionFunction(parseInt(amount), event?.messageReply?.senderID || Object.keys(event.mentions)[0]);

      return kaguya.reply(result.data);
    } catch (error) {
      console.error(error);
      return kaguya.reply("Đã xảy ra lỗi, vui lòng thử lại sau!");
    }
  },
};
