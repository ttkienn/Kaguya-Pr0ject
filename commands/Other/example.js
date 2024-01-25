export default {
  name: "example",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "Mẫu lệnh cơ bản",
  role: "member",
  aliases: ["ex", "1"],
  execute: async ({ api, event, Users, Threads, Economy }) => {
    // Ở đây là nơi bạn viết code cho lệnh
    return api.sendMessage("Đây là mẫu lệnh cơ bản", event.threadID, event.messageID);
  },
  events: async ({ api, event, Users, Threads, Economy }) => {
    // Ở đây là nơi bạn viết code cho các sự kiện
  },
  onReply: async ({ api, event, reply, Users, Threads, Economy }) => {
    // Ở đây là nơi bạn viết code cho handle reply
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // Ở đây là nơi bạn viết code cho handle reaction
  },
};
