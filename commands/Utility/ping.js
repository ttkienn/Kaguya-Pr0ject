export default {
    name: "ping",
    author: "Kaguya Project",
    cooldowns: 10,
    description: "Ping toàn bộ thành viên trong nhóm!",
    role: "admin",
    aliases: ["tagall"],
    execute: async ({ api, event, args }) => {
      try {
        const botID = api.getCurrentUserID();
        const group = await api.getThreadInfo(event.threadID);
        const listUserID = group.participantIDs.filter((ID) => ID != botID && ID != event.senderID);
        const body = args.length ? args.join(" ") : "@everyone";
        const mentions = listUserID.map((idUser) => ({ id: idUser, tag: "", fromIndex: -1 }));
        return api.sendMessage({ body, mentions }, event.threadID, event.messageID);
      } catch (e) {
        console.error(e);
      }
    },
  };
  