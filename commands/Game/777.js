class JackpotGame {
  name = "jackpot";
  author = "Kaguya Project";
  cooldowns = 10;
  description = "Một cuộc phiêu lưu đánh bạc trái cây với cơ hội Jackpot!";
  role = "member";
  aliases = [];

  async execute({ event, Economy, args }) {
    const MIN_BET_AMOUNT = 1000;
    const MAX_BET_AMOUNT = 500000;
    const SLOT_ITEMS = ["🍇", "🍉", "🍊", "🍏", "7⃣", "🍓", "🍒", "🍌", "🥝", "🥑", "🌽"];
    const { increase, decrease, getBalance } = Economy;

    const userMoney = (await getBalance(event.senderID)).data;

    const [moneyBet] = args;

    if (isNaN(moneyBet) || moneyBet <= 0) {
      return kaguya.reply("Số tiền cược không hợp lệ!");
    }

    if (moneyBet > userMoney) {
      return kaguya.reply(`Bạn thiếu ${kaguya.formatCurrency(moneyBet - userMoney)} để đặt cược!`);
    }

    if (moneyBet < MIN_BET_AMOUNT || moneyBet > MAX_BET_AMOUNT) {
      return kaguya.reply(`Số tiền cược không hợp lệ!\nTối thiểu: ${kaguya.formatCurrency(MIN_BET_AMOUNT)}\nTối đa: ${kaguya.formatCurrency(MAX_BET_AMOUNT)}`);
    }

    const spins = Array.from({ length: 3 }, () => SLOT_ITEMS[Math.floor(Math.random() * SLOT_ITEMS.length)]);

    var winMultiplier = calculateWinMultiplier(spins);

    const hasJackpot = Math.random() < 0.05;

    if (hasJackpot) {
      winMultiplier = 10;
    }

    const winnings = moneyBet * winMultiplier;
    const isWin = winMultiplier > 1;

    if (isWin) {
      await increase(winnings, event.senderID);
      kaguya.reply(`🎰 ${spins.join(" | ")} 🎰\nChúc mừng bạn! Bạn đã thắng ${kaguya.formatCurrency(winnings)}.`);
    } else {
      await decrease(moneyBet, event.senderID);
      kaguya.reply(`🎰 ${spins.join(" | ")} 🎰\nXin lỗi, bạn đã thua ${kaguya.formatCurrency(moneyBet)}.`);
    }

    if (hasJackpot) {
      kaguya.reply("🎉🎉🎉 Bạn đã trúng Jackpot! 🎉🎉🎉\nBạn đã giành được một phần thưởng lớn!");
    }
  }
}

function calculateWinMultiplier(spins) {
  if (spins.every((symbol) => symbol === "7⃣")) {
    return 10;
  } else if (spins[0] === spins[1] && spins[1] === spins[2]) {
    return 3;
  } else if (spins[0] === spins[1] || spins[0] === spins[2] || spins[1] === spins[2]) {
    return 2;
  } else {
    return 1;
  }
}

export default new JackpotGame();
