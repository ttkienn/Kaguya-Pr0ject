class Threads {
  name = "threads";
  author = "Kaguya Project";
  cooldowns = 0;
  description = "Cấm nhóm sử dụng bot";
  role = "owner";
  aliases = ["thread"];
  async execute({ api, event, Users, args, Threads }) {
    if (!event.isGroup) return kaguya.reply("Lệnh này chỉ có thể sử dụng trong nhóm");
    var [type, reason = "Không có lý do nào được đưa ra"] = args;
    switch (type) {
      case "list": {
        var { data } = await Threads.getAll();
        var msgArray = data.map((value, index) => {
          return `${index + 1}. TID: ${value.threadID} - Số thành viên: ${value.data.members}\nTên box: ${value.data.name}\n`;
        });
        var msg = msgArray.join("\n");
        return kaguya.reply(`${msg}\nReply tin nhắn này theo số thứ tự của box để ban!`, (err, info) => {
          client.handler.reply.set(info.messageID, {
            author: event.senderID,
            name: this.name,
            autosend: true,
            type: "ban",
            threadDATA: data,
          });
        });
      }
      case "ban": {
        var TID = await Threads.ban(event.threadID, { status: true, reason });
        return kaguya.reply(TID.data);
      }
      case "unban": {
        var TID = await Threads.ban(event.threadID, { status: false, reason: "" });
        console.log(TID)
        return kaguya.reply(`Đã unban thành công nhóm mang TID: ${event.threadID}`);
      }
      default: {
        var name = client.config.prefix + this.name;
        return kaguya.reply(`[ THREADS ]\n${name} ban <Sử dụng để ban nhóm>\n${name} unban <Sử dụng để unban nhóm>\n${name} list <Sử dụng để xem danh sách nhóm>`);
      }
    }
  }
}
export default new Threads();
