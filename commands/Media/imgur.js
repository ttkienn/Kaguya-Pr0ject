import axios from "axios";

export default {
  name: "imgur",
  author: "Thiệu Trung Kiên",
  cooldowns: 10,
  description: "Upload ảnh lên imgur",
  role: "member",
  aliases: ["uploadimage"],
  execute: async ({ event }) => {
    const clientId = "fc9369e9aea767c";
    const client = axios.create({
      baseURL: "https://api.imgur.com/3/",
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
    });

    const uploadImage = async (url) => {
      return (
        await client.post("image", {
          image: url,
        })
      ).data.data.link;
    };

    const array = [];

    if (event.type !== "message_reply" || event.messageReply.attachments.length === 0) {
      return kaguya.reply("Vui lòng reply vào bức ảnh bạn cần tải lên");
    }

    for (const { url } of event.messageReply.attachments) {
      try {
        const res = await uploadImage(url);
        array.push(res);
      } catch (err) {
        console.log(err);
      }
    }

    kaguya.reply(`» Đã tải lên thành công ${array.length} ảnh\nThất bại : ${array.length - event.messageReply.attachments.length}\n» Link ảnh:\n${array.join("\n")}`);
  },
};
