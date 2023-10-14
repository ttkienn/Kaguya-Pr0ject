export default {
  name: "ping",
  author: "Kaguya Project",
  cooldowns: 10,
  description: "Ping toàn bộ thành viên trong nhóm!",
  role: "admin",
  aliases: ["tagall"],
  lang: {
    vi_VN: {
      "text": "Xin chào"
    },
    en_US: {
      "text": "Everyone"
    }
  },
  execute: async ({ api, event, args }) => {
    try {
      const text = args.join(" ") || getLang("plugins.ping.text", "ping");
      const botID = api.getCurrentUserID();
      const group = await api.getThreadInfo(event.threadID);

      const mentions = group.participantIDs
        .filter((e) => e !== botID && e !== event.senderID)
        .reduce((accumulator, e, i) => {
          accumulator.push({ tag: text[i] || "", id: e });
          return accumulator;
        }, []);

      api.sendMessage(
        {
          body: mentions.length > text.length ? text.padEnd(mentions.length, " ") : text,
          mentions,
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      console.log(e);
    }
  },
};
