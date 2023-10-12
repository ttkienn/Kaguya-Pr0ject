const evalCommand = {
  name: "sendnoti",
  author: "Kaguya Project",
  cooldowns: 5,
  description: "Gửi thông báo tới tất cả các nhóm!",
  role: "admin",
  aliases: ["thongbao"],
  execute: async ({ api, event, args, Threads }) => {
    const noidung = args.join(" ");
    if (!noidung) return api.sendMessage("Vui lòng nhập nội dung bạn cần gửi đến tất cả các nhóm!", event.threadID, event.messageID);

    let count = 0;
    let fail = 0;

    try {
      const { data: allThreads } = await Threads.getAll();

      for (const value of allThreads) {
        if (!isNaN(parseInt(value.threadID)) && value.threadID !== event.threadID) {
          const { error } = await sendMessage(api, `[ Thông báo từ admin ]\n\n${noidung}`, value.threadID);
          if (error){
            fail++
          }
          else {
            count++;
          }
        }
      }

      return api.sendMessage(`[ SENDNOTI ]\nThành công: ${count}\nThất bại: ${fail}`, event.threadID, event.messageID);
    } catch (err) {
      return api.sendMessage(`Lỗi: ${err}`, event.threadID, event.messageID);
    }
  },
};

async function sendMessage(api, message, threadID) {
  return new Promise((resolve) => api.sendMessage(message, threadID, (error) => resolve({ error })));
}

export default evalCommand;
