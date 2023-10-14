import { log } from "../logger/index.js";
export class CommandHandler {
  constructor({ api, event, Threads, Users, Economy, Exp }) {
    this.arguments = {
      api,
      event,
      Users,
      Threads,
      Economy,
      Exp,
    };
    this.client = global.client;
    this.config = this.client?.config || {};
    this.commands = this.client?.commands || new Map();
    this.aliases = this.client?.aliases || new Map();
    this.cooldowns = this.client?.cooldowns || new Map();
    this.handler = this.client?.handler || {};
    this.events = this.client?.events || {};
  }

  async handleCommand() {
    try {
      const { Users, Threads, api, event } = this.arguments;
      const { body, threadID, senderID, isGroup, messageID } = event;
      const getThreadPromise = Threads.find(event.threadID);
      const getUserPromise = Users.find(senderID);

      const [getThread, banUserData] = await Promise.all([getThreadPromise, getUserPromise]);

      const prefix = getThread?.data?.data?.prefix || this.config.prefix;
      const banUser = banUserData?.data?.data?.banned;
      if (!body.startsWith(prefix)) {
        return;
      }

      if (banUser?.status && !this.config.ADMIN_IDS.includes(event.senderID)) {
        return api.sendMessage(getLang("handler.user_ban", banUser.reason), threadID);
      }

      if (isGroup) {
        const banThread = getThread?.data?.data?.banned;

        if (banThread?.status && !this.config.ADMIN_IDS.includes(event.senderID)) {
          return api.sendMessage(getLang("handler.thread_ban", banThread.reason), threadID);
        }
      }

      const [cmd, ...args] = body.slice(prefix.length).trim().split(/\s+/);
      const commandName = cmd.toLowerCase();
      const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
      if (!command) {
        return api.sendMessage(getLang("handler.command_not_found"), threadID, messageID);
      }

      if (!this.cooldowns.has(command.name)) {
        this.cooldowns.set(command.name, new Map());
      }

      const currentTime = Date.now();
      const timeStamps = this.cooldowns.get(commandName);
      const cooldownAmount = (command.cooldowns ?? 5) * 1000;

      if (!this.config.ADMIN_IDS.includes(senderID)) {
        if (timeStamps.has(senderID)) {
          const expTime = timeStamps.get(senderID) + cooldownAmount;
          if (currentTime < expTime) {
            const timeLeft = (expTime - currentTime) / 1000;
            return api.sendMessage(getLang("handler.command_cooldowns", timeLeft.toFixed(1)), threadID, messageID);
          }
        }

        timeStamps.set(senderID, currentTime);
        setTimeout(() => {
          timeStamps.delete(senderID);
        }, cooldownAmount);
      }

      const { adminIDs: threadAdminIDs } = await api.getThreadInfo(threadID);

      if ((command.role === "admin" || command.role === "owner") && !threadAdminIDs.includes(senderID) && !this.config.ADMIN_IDS.includes(senderID)) {
        return api.sendMessage(getLang("handler.command_noPermission"), threadID, messageID);
      }

      command.execute({ ...this.arguments, args });
    } catch (error) {
      console.log(error);
    }
  }
  handleEvent() {
    try {
      this.commands.forEach((event) => {
        if (event.events) {
          event.events({ ...this.arguments });
        }
      });
      this.events.forEach((event) => {
        event.execute({ ...this.arguments });
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async handleReply() {
    const { messageReply } = this.arguments.event;
    if (!messageReply) return;

    const reply = this.handler.reply.get(messageReply.messageID);
    if (!reply) return;

    if (reply.unsend) this.arguments.api.unsendMessage(messageReply.messageID);

    const command = this.commands.get(reply.name);
    if (!command) {
      return await this.arguments.api.sendMessage("Missing data to execute handle reply!", this.arguments.event.threadID, this.arguments.event.messageID);
    }

    if (parseInt(reply.expires)) {
      setTimeout(() => {
        this.handler.reply.delete(messageReply.messageID);
        log([
          { message: "[ Handler Reply ]: ", color: "yellow" },
          { message: `Deleted reply data for command ${reply.name}! after ${reply.expires} seconds <${messageReply.messageID}>`, color: "green" },
        ]);
      }, reply.expires * 1000);
    }

    command.onReply && (await command.onReply({ ...this.arguments, reply }));
  }

  async handleReaction() {
    if (this.arguments.event.type !== "message_reaction") {
      return;
    }
    const messageID = this.arguments.event.messageID;
    const reaction = this.handler.reactions.get(messageID);
    if (!reaction) {
      return;
    }
    const command = this.commands.get(reaction.name);
    if (!command) {
      return await this.arguments.api.sendMessage("Missing data to execute handle reaction", this.arguments.event.threadID, messageID);
    }
    command.onReaction && (await command.onReaction({ ...this.arguments, reaction }));
  }
}
