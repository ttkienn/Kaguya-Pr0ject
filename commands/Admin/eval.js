import axios from "axios";

export default {
  name: "eval",
  author: "Kaguya Project",
  role: "owner",
  cooldowns: 10,
  description: "Eval Command",
  aliases: ['run'],
  async execute({ api, event, args, Threads, Users, Economy }) {
    try {
      const code = args.join(" ");
      (function() {
        try {
          eval(`
            ${code}
          `);
        } catch (err) {
          console.error(err);
        }
      })(api, args, event, Threads, Users, Economy, axios);

    } catch (err) {
      console.error(err);
    }
  },
};
