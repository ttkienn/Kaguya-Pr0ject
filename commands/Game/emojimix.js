import axios from "axios";
import fs from "fs";

const emojiJSON = JSON.parse(fs.readFileSync("./cache/emoji/emoji.json", "utf-8"));

export default {
  name: "emojimix",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "Tạo hình ảnh từ 2 icon mà bạn muốn",
  async execute({ api, args, event }) {
    const [emoji_1, emoji_2] = args;

    if (!emoji_1 || !emoji_2) return kaguya.reply("Vui lòng nhập đúng format!\nVí dụ: !emojimix 😎 😇 ");
    if (!emojiJSON.includes(emoji_1) || !emojiJSON.includes(emoji_2)) return kaguya.reply("Icon bạn nhập không hợp lệ!");

    try {
      const mix = await axios.get(encodeURI(`https://tenor.googleapis.com/v2/featured?key=AIzaSyACvEq5cnT7AcHpDdj64SE3TJZRhW-iHuo&client_key=emoji_kitchen_funbox&q=${emoji_1}_${emoji_2}&collection=emoji_kitchen_v6&contentfilter=high`));

      if (!mix.data.results.length) return kaguya.reply("Không thể mix emoji này, vui lòng thử lại với emoji khác!");

      const { png_transparent: { url } } = mix.data.results[0].media_formats;
      const getImg = await axios.get(url, { responseType: "stream" });

      return api.sendMessage({
        body : `Kết quả của icon : ${emoji_1} và ${emoji_2} :`,
        attachment: getImg.data
      }, event.threadID, event.messageID)
    } catch (error) {
      console.error("Lỗi xảy ra: ", error);
      return kaguya.reply("Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.");
    }
  },
};
