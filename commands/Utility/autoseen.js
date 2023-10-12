class AutoSeen {
  name = "autoseen";
  author = "Thiệu Trung Kiên";
  cooldowns = 60;
  description = "Seen tin nhắn của người dùng!";
  role = "owner";
  aliases = ["as"];
  config = false;
  async events({ api }) {
    this.config && api.markAsReadAll(() => {});
  }
  async execute() {
    this.config = this.config ? false : true;
    return kaguya.reply(`Đã ${this.config ? "bật" : "tắt"} tính năng tự động seen tin nhắn người dùng`);
  }
}

export default new AutoSeen();
