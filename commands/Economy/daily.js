class CheckTT {
  name = "daily";
  author = "Kaguya Project";
  cooldowns = 10;
  description = "Điểm danh hàng ngày để nhận coins";
  role = "member";
  aliases = ["diemdanh"];

  async execute({ event, Economy, Users }) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStamps = 24 * 60 * 60
    try {
      const lastCheckedTime = await Users.find(event.senderID);
      if (lastCheckedTime?.data?.data?.other?.cooldowns && currentTime - parseInt(lastCheckedTime?.data?.data?.other?.cooldowns) < timeStamps) {
        const remainingTime = timeStamps - (currentTime - lastCheckedTime?.data?.data?.other?.cooldowns);
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        return kaguya.reply(`Bạn đã điểm danh. Thời gian còn lại cho cooldown: ${hours} giờ ${minutes} phút ${seconds} giây.`);
      }

      const coinsToAdd = 10000;

      await Economy.increase(coinsToAdd, event.senderID);
      await Users.update(event.senderID, {
        other: {
          cooldowns: currentTime,
        },
      });
      kaguya.reply(`Điểm danh thành công!\nPhần thưởng của bạn là : ${kaguya.formatCurrency(coinsToAdd)}`);
    } catch (error) {
      console.error("Lỗi khi thực hiện điểm danh:", error);
    }
  }
}

export default new CheckTT();
