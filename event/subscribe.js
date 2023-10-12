import { log } from "../logger/index.js";
export default {
  name: "subcribe",
  execute: async ({ api, event, Threads, Users }) => {
    var threads = (await Threads.find(event.threadID))?.data?.data || {};
    if(!threads){
      await Threads.create(event.threadID)
    }
    switch (event.logMessageType) {
      case "log:unsubscribe":
        {
          if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
            await Threads.remove(event.threadID);
            return log([
              {
                message: "[ THREADS ]: ",
                color: "yellow",
              },
              {
                message: `Đã xoá dữ liệu của nhóm mang TID : ${event.threadID} vì kick bot ra khỏi nhóm`,
                color: "green",
              },
            ]);
          }
          await Threads.update(event.threadID, {
            members: +threads.members - 1,
          });
          kaguya.reply(event.logMessageBody);
        }
        break;
      case "log:subscribe": {
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          api.changeNickname(`Prefix: ${global.client.config.prefix} <=> ${!global.client.config.BOT_NAME ? "Github: ttkienn" : global.client.config.BOT_NAME}`, event.threadID, api.getCurrentUserID());
          return kaguya.send(`The connection was successful! This bot, created by ThieuTrungKien, is now available to you.\n\nThank you for your interest in our products. Have fun spending time with us!`, event.threadID);
        }
        else {
          for(let i of event.logMessageData.addedParticipants){
            await Users.create(i.userFbId)
          }
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length
          })
          return kaguya.send(event.logMessageBody)
        }
      }
    }
  },
};
