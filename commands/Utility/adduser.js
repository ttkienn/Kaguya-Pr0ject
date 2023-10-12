export default {
  name: "adduser",
  author: "Kaguya Project",
  cooldowns: 10,
  description: "Thêm người dùng vào nhóm",
  role: "member",
  aliases: ["add"],
  async execute({ api, event, args }) {
    try {
      var [url] = args;
      if (!url) return kaguya.reply(`Sai format !\nHướng dẫn sử dụng : ${global.client.config.prefix}adduser [uid hoặc link]`);

      if (/facebook\.com/.test(url)) {
        var match = url.match(/\b(?:https?:\/\/)?(?:www\.)?(?:m\.|mbasic\.)?facebook\.com\/(?!profile\.php)([a-zA-Z0-9.-]+)(?:\/)?/);
        if (match) url = match[1];
      }

      var entity_id = (await kaguya.findUID(url)).data.entity_id;
      var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(event.threadID);
      if (participantIDs.includes(entity_id)) return kaguya.reply("Người dùng đã có trong nhóm!");

      api.addUserToGroup(entity_id, event.threadID, () => {
        if (approvalMode && !adminIDs.some((item) => item.id === api.getCurrentUserID())) return kaguya.reply("Đã thêm người dùng vào danh sách phê duyệt!");
        return kaguya.reply("Đã thêm người dùng vào nhóm thành công");
      });
    } catch (err) {
      console.log(err);
      kaguya.reply("Không thể thêm người dùng vào nhóm, vui lòng thử lại sau");
    }
  },
};
