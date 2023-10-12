class Help {
  constructor() {
    this.name = "help";
    this.author = "Kaguya Project";
    this.cooldowns = 60;
    this.description = "Xem danh sách lệnh của bot!";
    this.role = "member";
    this.aliases = [];
    this.commands = global.client.commands;
  }

  roleText = (role) => ({ member: "Người dùng", Admin: "Quản trị viên nhóm", owner: "Người điều hành bot" }[role] || "Chưa rõ");
  aliasesText = (aliases) => (Array.isArray(aliases) && aliases.length > 0 && !aliases.includes("") ? aliases.join(", ") : "Không có");

  async execute({ args, event }) {
    const [pageStr] = args;
    const getCommands = this.commands.get(pageStr);
    if (!getCommands) {
      const page = parseInt(pageStr) || 1;
      const commandsPerPage = 10;
      const startIndex = (page - 1) * commandsPerPage;
      const endIndex = page * commandsPerPage;

      if (!isNaN(page) && page > 0) {
        const commandList = Array.from(this.commands.values());
        const totalPages = Math.ceil(commandList.length / commandsPerPage);

        if (page <= totalPages) {
          const commandsToDisplay = commandList.slice(startIndex, endIndex);

          let msg = ``;

          commandsToDisplay.forEach((command, index) => {
            msg += `\n[${startIndex + index + 1}] Tên: ${command.name}\nQuyền hạn: ${this.roleText(command.role)}\nCác tên gọi khác: ${this.aliasesText(command.aliases)}\n`;
          });

          msg += `\n\nĐể xem hướng dẫn cụ thể của một lệnh, hãy reply tin nhắn này với số thứ tự của lệnh đó.`;
          msg += `\n\nDanh sách lệnh (Trang ${page}/${totalPages}):\nSử dụng : ${global.client.config.prefix}${this.name} <page> để sang trang tiếp theo!\n`;
          kaguya.reply(msg, (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: this.name,
              type: "info",
              author: event.senderID,
              commands: commandList,
            });
            setTimeout(() => kaguya.unsend(info.messageID), 20000);
          });
        } else {
          kaguya.reply("Không có lệnh nào để hiển thị");
        }
      }
    } else {
      const replyMsg = `[ ${getCommands.name.toUpperCase()} ]\n-> Tên : ${getCommands.name}\n-> Tác giả : ${getCommands.author}\n-> Thời gian chờ : ${getCommands.cooldowns}s\n-> Mô tả : ${getCommands.description}\n-> Quyền hạn : ${this.roleText(getCommands.role)}\n-> Các tên khác có thể sử dụng : ${this.aliasesText(getCommands.aliases)}`;
      kaguya.reply(replyMsg);
    }
  }

  async onReply({ reply, event }) {
    if (reply.author != event.senderID) return;
    if (event.body > reply.commands.length || !parseInt(event.body)) {
      return kaguya.reply("Số thứ tự mà bạn reply không hợp lệ!\nVui lòng thử lại!");
    }
    const getCommands = reply.commands[event.body - 1];
    const replyMsg = `[ ${getCommands.name.toUpperCase()} ]\n-> Tên : ${getCommands.name}\n-> Tác giả : ${getCommands.author}\n-> Thời gian chờ : ${getCommands.cooldowns}s\n-> Mô tả : ${getCommands.description}\n-> Quyền hạn : ${this.roleText(getCommands.role)}\n-> Các tên khác có thể sử dụng : ${this.aliasesText(getCommands.aliases)}`;

    kaguya.reply(replyMsg);
  }
}

export default new Help();
