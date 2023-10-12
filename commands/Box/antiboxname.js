class antiboxname {
  name = "antiboxname";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "Cấm đổi tên box!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads }) {
    try {
      var threads = (await Threads.find(event.threadID))?.data?.data;
      var status = threads?.anti?.nameBox ? false : true;
      await Threads.update(event.threadID, {
        anti: {
          nameBox: status,
        },
      });
      return kaguya.reply(`Đã ${status ? "bật" : "tắt"} chế độ cấm đổi tên box!`);
    } catch (err) {
      console.error(err);
      return kaguya.reply("Đã xảy ra lỗi ngoài ý muốn!");
    }
  }
}

export default new antiboxname();
