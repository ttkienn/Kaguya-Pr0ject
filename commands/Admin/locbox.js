import sleep from "time-sleep";

class locbox {
  name = "locbox";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "Lọc box dưới thành viên được quy định!";
  role = "owner";
  aliases = [];

  async execute({ api, event, Threads, args }) {
    try {
      const [length] = args.map(Number);

      if (isNaN(length) || length <= 0) {
        return kaguya.reply("Vui lòng nhập một con số hợp lệ!");
      }

      const threads = (await Threads.getAll()).data;
      const findThreads = threads.filter((thread) => thread.data.members < length);

      if(!findThreads.length){
        return kaguya.reply(`Không tìm thấy box nào dưới ${length} thành viên!`)
      }

      for (const threadData of findThreads) {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadData.threadID);
        await sleep(1000);
      }
    } catch (error) {
      console.error(error);
      return kaguya.reply("Đã xảy ra lỗi ngoài ý muốn!");
    }
  }
}

export default new locbox();
