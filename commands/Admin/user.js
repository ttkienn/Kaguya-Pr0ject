export default {
  name: "user",
  author: "Kaguya Project",
  cooldowns: 0,
  description: "Cấm người dùng sử dụng bot",
  role: "owner",
  aliases: ["memberban", "banuser"],
  execute: async ({ api, event, Users, args }) => {
    var [type] = args;
    switch (type) {
      case "ban": {
        return api.sendMessage(`Vui lòng nhập lý do cần ban: `, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "user",
            author: event.senderID,
            type: "ban",
          });
        });
      }
      case "unban": {
        return api.sendMessage(`Vui lòng tag người bạn muốn unban, ví dụ : @1 @2 ( có thể tag số lượng lớn )`, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "user",
            author: event.senderID,
            type: "confirm",
            choose: "unban",
          });
        });
      }
    }
  },
  onReply: async ({ api, event, Users, reply }) => {
    switch (reply.type) {
      case "ban": {
        return api.sendMessage(
          `Vui lòng tag người bạn muốn ban, ví dụ : @1 @2 ( có thể tag số lượng lớn )`,
          event.threadID,
          (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "user",
              author: event.senderID,
              type: "confirm",
              choose: "ban",
              reason: event.body,
            });
          },
          event.messageID
        );
      }
      case "confirm": {
        var msg = "",
          listUID = event.mentions;
        if (!Object.keys(listUID).length) {
          return api.sendMessage(`UID người dùng cần ${reply.choose == "ban" ? "ban" : "unban"} không hợp lệ, reply tin nhắn này bằng cách tag người dùng cần ban\n\nVí dụ : @1 @2`, event.threadID, (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "user",
              author: event.senderID,
              type: "confirm",
              choose: reply.choose,
              reason: event.body,
            });
          });
        }
        for (let [uid, name] of Object.entries(listUID)) {
          var dataUser = await Users.ban(uid, { status: reply.choose == "ban" ? true : false, reason: reply.choose == "ban" ? reply.reason : "" });
          dataUser.status ? (msg += `${uid} - ✅ (${name})\n`) : (msg += `${uid} - ❌ (Null)\n`);
        }
        return api.sendMessage(`[ ${reply.choose == "ban" ? "BAN USER" : "UNBAN USER"} ]\n` + msg + `\n${reply.choose == "ban" ? `\nLý do ban : ${reply.reason}` : ""}\nTổng : ${Object.keys(listUID).length} người dùng\n✅ : Thành công\n❌ : Thất Bại\n(Thất bại là do chưa có dữ liệu người dùng trong database)`, event.threadID, event.messageID);
      }
    }
  },
};
