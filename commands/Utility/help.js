class Help {
  constructor() {
    this.name = "help";
    this.author = "Kaguya Project";
    this.cooldowns = 60;
    this.description = "Xem danh sách lệnh của bot!";
    this.role = "member";
    this.aliases = [];
    this.commands = global.client.commands;
    this.lang = {
      vi_VN: {
        list: "[$1] Tên: $2\nQuyền hạn: $3\nCác tên gọi khác: $4\n\n",
        end: "Để xem hướng dẫn cụ thể của một lệnh, hãy reply tin nhắn này với số thứ tự của lệnh đó.",
        total: `Danh sách lệnh (Trang $1/$2):\nSử dụng: ${global.client.config.prefix}${this.name} <page> để sang trang tiếp theo!`,
        role_member: "Người dùng",
        role_admin: "Quản trị viên",
        role_owner: "Người điều hành bot",
        not_found: "Không có lệnh nào để hiện thị!",
        error: "Đã xảy ra lỗi, vui lòng thử lại sau!",
        details: `[ $1 ]\n-> Tên : $2 \n-> Tác giả : $3 \n-> Thời gian chờ : $4s\n-> Mô tả : $5\n-> Quyền hạn : $6\n-> Các tên khác có thể sử dụng : $7`,
        choose_invalid: `Số thứ tự mà bạn chọn không hợp lệ!`,
      },
      en_US: {
        list: "[$1] Name: $2\nPermission: $3\nAliases: $4\n\n",
        end: "To view specific instructions for a command, reply to this message with the command's number.",
        total: `Command List (Page $1/$2):\nUse: ${global.client.config.prefix}${this.name} <page> to navigate to the next page!`,
        role_member: "Member",
        role_admin: "Administrator",
        role_owner: "Bot Owner",
        not_found: "No commands to display!",
        error: "An error occurred, please try again later!",
        details: `[ $1 ]\n-> Name: $2 \n-> Author: $3 \n-> Cooldown: $4s\n-> Description: $5\n-> Permission: $6\n-> Other usable names: $7`,
        choose_invalid: `The number you chose is invalid!`,
      },
    };
  }

  roleText = (role) => ({ member: getLang("plugins.help.role_member"), admin: getLang("plugins.help.role_admin"), owner: getLang("plugins.help.role_owner") }[role.toLowerCase()] || "Chưa rõ");

  aliasesText = (aliases) => (Array.isArray(aliases) && aliases.length > 0 && !aliases.includes("") ? aliases.join(", ") : "Not Found");

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
            msg += getLang("plugins.help.list", startIndex + index + 1, command.name, getLang(`plugins.help.role_${command.role}`), this.aliasesText(command.aliases));
          });

          msg += `\n${getLang("plugins.help.end")}`;
          msg += `\n\n${getLang("plugins.help.total", page, totalPages)}`;

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
          kaguya.reply(getLang("plugins.help.not_found"));
        }
      }
    } else {
      const replyMsg = getLang("plugins.help.details", getCommands.name.toUpperCase(), getCommands.name, getCommands.author, getCommands.cooldowns, getCommands.description, this.roleText(getCommands.role), this.aliasesText(getCommands.aliases))
      kaguya.reply(replyMsg);
    }
  }

  async onReply({ reply, event }) {
    if (reply.author != event.senderID) return;

    if (event.body > reply.commands.length || !parseInt(event.body)) {
      return kaguya.reply(getLang("plugins.help.choose_invaild"));
    }

    const getCommands = reply.commands[event.body - 1];

    const replyMsg = getLang("plugins.help.details", getCommands.name.toUpperCase(), getCommands.name, getCommands.author, getCommands.cooldowns, getCommands.description, this.roleText(getCommands.role), this.aliasesText(getCommands.aliases))
    kaguya.reply(replyMsg);
  }
}

export default new Help();
