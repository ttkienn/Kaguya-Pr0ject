import fs from "fs";

class Admin {
  name = "admin";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "Thêm hoặc xoá admin";
  role = "member";
  aliases = [];

  async onLoad() {
    if (typeof global.client?.setConfig !== "function") {
      global.client.__proto__.setConfig = function (newConfig) {
        try {
          Object.assign(global.client.config, newConfig);
          fs.writeFileSync("./setup/config.js", `export default ${JSON.stringify(global.client.config, null, 2)};`);
        } catch (err) {
          this.emit("system:err", err);
        }
      };
    }
  }

  async execute({ event, args }) {
    try {
      var [type, tags] = args;
      tags = event.mentions && Object.keys(event.mentions).length > 0 ? event.mentions : tags && !isNaN(tags) ? { [tags]: "" } : false;

      if (["add", "remove"].includes(type) && !global.client.config.ADMIN_IDS.includes(event.senderID)) {
        return kaguya.reply("Bạn không có quyền để sử dụng lệnh này!");
      }

      switch (type) {
        case "add":
          return this.addAdmin(tags);

        case "remove":
          return this.removeAdmin(tags);

        case "list":
        case "-l":
        case "-all":
          return this.listAdmins();

        default:
          var commandName = client.config.prefix + this.name;
          return kaguya.reply(`[ ADMIN ]\n${commandName} add <@tags hoặc uid> để thêm người dùng trở thành admin\n${commandName} remove <@tags hoặc uid> để gỡ quyền hạn admin của người dùng\n${commandName} list để xem danh sách admin!`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  addAdmin(tags) {
    if (!tags) {
      return kaguya.reply(`Vui lòng tags hoặc nhập UID người mà bạn cần thêm để trở thành admin!`);
    }

    const addedUids = this.processAdmins(tags, "add");
    const statusMessage = this.getStatusMessage(addedUids, "Thêm");

    return kaguya.reply(statusMessage);
  }

  removeAdmin(tags) {
    if (!tags) {
      return kaguya.reply(`Vui lòng tags hoặc nhập UID người mà bạn cần xoá khỏi danh sách admin!`);
    }

    const removedUids = this.processAdmins(tags, "remove");
    const statusMessage = this.getStatusMessage(removedUids, "Xoá");

    return kaguya.reply(statusMessage);
  }

  listAdmins() {
    const adminIds = global.client.config.ADMIN_IDS;

    if (adminIds.length === 0) {
      return kaguya.reply("Danh sách admin đang trống.");
    }

    const adminList = adminIds.join(", ");
    return kaguya.reply(`Danh sách admin:\n${adminList}`);
  }

  processAdmins(tags, action) {
    const uidsToProcess = Object.keys(tags);
    const processedUids = [[], []];

    for (var uid of uidsToProcess) {
      if ((action === "add" && global.client.config.ADMIN_IDS.includes(uid)) || (action === "remove" && !global.client.config.ADMIN_IDS.includes(uid))) {
        processedUids[0].push(uid);
      } else {
        global.client.setConfig({
          ADMIN_IDS: action === "add" ? [...global.client.config.ADMIN_IDS, uid] : global.client.config.ADMIN_IDS.filter((existingUid) => existingUid !== uid),
        });
        processedUids[1].push(uid);
      }
    }

    return processedUids;
  }

  getStatusMessage(processedUids, action) {
    const [failedUids, successUids] = processedUids;
    const status = successUids.length > 0 ? "Thành Công" : "Thất Bại";

    let message = `Trạng thái: ${status}`;

    if (successUids.length > 0) {
      message += `\n\nUID được ${action.toLowerCase()} vào: ${successUids.join(", ")}`;
    }

    if (failedUids.length > 0) {
      message += `\n\nUID đã có sẵn trong danh sách admin: ${failedUids.join(", ")}`;
    }

    return message;
  }
}

export default new Admin();
