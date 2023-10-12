import fs from "fs-extra";
import path from "path";

class CMD {
  constructor() {
    this.name = "cmd";
    this.author = "Kaguya Project";
    this.role = "owner";
    this.description = "Quản lý plugins của bạn!";
    this.cooldown = 10;
    this.aliases = ["command", "commands"];
  }

  async execute({ args }) {
    const [type, commandName] = args;

    switch (type) {
      case "load":
        this.loadCommand(commandName);
        break;
      case "loadAll":
        this.loadAllCommands();
        break;
      default:
        const defaultName = `${global.client.config.prefix}${this.name}`;
        kaguya.reply(`[ CMD ]\n\n=> load <tên file> (ví dụ ${defaultName} load cmd )\n=> loadAll để load lại toàn bộ lệnh!`);
        break;
    }
  }

  async loadCommand(commandName) {
    try {
      if (!commandName) {
        return kaguya.reply("Vui lòng nhập tên plugins bạn cần load");
      }

      const pluginPath = this.findCommandPath(commandName);

      if (!pluginPath) {
        return kaguya.reply("Không tìm thấy lệnh này!");
      }

      const [oldPlugins, plugins] = await this.loadPlugin(pluginPath);

      if (!plugins?.name || typeof plugins?.execute !== "function") {
        return kaguya.reply(`Lệnh này không đủ điều kiện để load!`);
      }

      if (global.client.commands.has(oldPlugins?.name)) {
        global.client.commands.delete(oldPlugins?.name);
      }

      global.client.commands.set(plugins.name, plugins);

      kaguya.reply(`[ CMD ]\nTrạng thái: Thành công\nTên: ${plugins.name}\nTác giả: ${plugins?.author}\nDescriptions: ${plugins?.description}`);
    } catch (err) {
      kaguya.reply("Không thể load lệnh này!");
    }
  }

  async loadAllCommands() {
    try {
      const dir = fs.readdirSync("./commands");
      for (const dirName of dir) {
        const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
        for (const fileName of commandsInDir) {
          const commandPath = path.join("commands", dirName, fileName + ``);

          const [oldPlugins, plugins] = await this.loadPlugin(commandPath);

          if (plugins?.name && typeof plugins?.execute === "function") {
            if (global.client.commands.has(oldPlugins?.name)) {
              global.client.commands.delete(oldPlugins?.name);
            }

            global.client.commands.set(plugins.name, plugins);
          }
        }
      }

      kaguya.reply("[ CMD ]\nTrạng thái: Thành công\nTất cả lệnh đã được load lại!");
    } catch (err) {
      kaguya.reply("Không thể load lại toàn bộ lệnh!");
    }
  }

  findCommandPath(commandName) {
    const dir = fs.readdirSync("./commands");
    for (const dirName of dir) {
      const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
      for (const fileName of commandsInDir) {
        if (fileName === `${commandName}.js`) {
          return path.join("commands", dirName, fileName + ``);
        }
      }
    }
    return null;
  }

  async loadPlugin(pluginPath) {
    const [oldPlugins, plugins] = await Promise.all([
      import("../../" + pluginPath),
      import("../../" + pluginPath + `?version=${Math.random()}`)
    ]);
    return [oldPlugins.default, plugins.default];
  }
}

export default new CMD();
