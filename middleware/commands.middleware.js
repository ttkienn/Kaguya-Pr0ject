import fs from "fs-extra";
import { log } from "../logger/index.js";
export const commandMiddleware = async () => {
  try {
    const dir = await fs.readdir("./commands");
    for (const directory of dir) {
      if (fs.statSync(`./commands/${directory}`).isDirectory()) {
        const cmd = await fs.readdir(`./commands/${directory}`);
        for (const command of cmd) {
          try {
            const commands = (await import(`../commands/${directory}/${command}`)).default;
            if (commands?.onLoad && typeof commands?.onLoad == "function") {
              await commands.onLoad();
            }
            if (!commands?.name) {
              log([
                {
                  message: "[ COMMAND ]: ",
                  color: "green",
                },
                {
                  message: getLang("handler.command_load_error", command, "không có tên lệnh!"),
                  color: "red",
                },
              ]);
              continue;
            }
            if (typeof commands?.execute !== "function") {
              log([
                {
                  message: "[ COMMAND ]: ",
                  color: "green",
                },
                {
                  message: getLang("handler.command_load_error", command, "không có hàm thực thi!"),
                  color: "red",
                },
              ]);
              continue;
            }
            await global.client.commands.set(commands.name, commands);
            await log([
              {
                message: "[ COMMAND ]: ",
                color: "green",
              },
              {
                message: getLang("handler.command_load", `/${directory.toLowerCase()}/${commands.name}`),
                color: "white",
              },
            ]);
            if (commands.lang && Object.keys(commands.lang).length > 0) {
              global.language[client.config.language].plugins[commands.name] = commands.lang[client.config.language];
            }
            if (commands.aliases && Array.isArray(commands.aliases)) {
              for (const alias of commands.aliases) {
                if (global.client.aliases.has(alias)) {
                  log([
                    {
                      message: "[ ALIAS ]: ",
                      color: "ocean",
                    },
                    {
                      message: getLang("handler.command_aliases_exitsts", `<${global.client.aliases.get(alias)}>`, command.name),
                      color: "red",
                    },
                  ]);
                  continue;
                }
                if (alias == "" || !alias) {
                  continue;
                }
                global.client.aliases.set(alias, commands.name);
              }
            }
          } catch (error) {
            log([
              {
                message: "[ COMMAND ]: ",
                color: "green",
              },
              {
                message: getLang("handler.command_load_error", command, error),
                color: "red",
              },
            ]);
            continue;
          }
        }
      }
    }
  } catch (error) {
    log([
      {
        message: "[ COMMAND ]: ",
        color: "green",
      },
      {
        message: getLang("handler.error", error),
        color: "red",
      },
    ]);
  }
};
