import axios from "axios";
import fs from "fs-extra";

export default function ({ api, event }) {
  const formatCurrency = (number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 9 }).format(number);

  const send = (message, callback) => (typeof callback === "function" ? api.sendMessage(message, event.threadID, callback) : api.sendMessage(message, event.threadID));

  const reply = (message, callback) => (typeof callback === "function" ? api.sendMessage(message, event.threadID, callback, event.messageID) : api.sendMessage(message, event.threadID, event.messageID));

  const downloadFile = async (url, path) => {
    const response = await axios.get(url, { responseType: "stream" });

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(path);
      response.data.pipe(fileStream);

      fileStream.on("error", (err) => {
        reject(err);
      });

      fileStream.on("finish", () => {
        resolve();
      });
    });
  };

  const isVaildUrl = (input) => (input.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zAZ0-9@:%_\+.~#?&//=]*)/g) === null ? false : true);

  const detectText = async (text) => {
    try {
      const response = await axios.get(`https://api.microsofttranslator.com/V2/Http.svc/Detect?&appid=68D088969D79A8B23AF8585CC83EBA2A05A97651&text=${text}`);
      return />(.*?)</.exec(response.data)[1];
    } catch (error) {
      throw error;
    }
  };

  const unsend = (messageID) => api.unsendMessage(messageID);

  const findUID = async (vanity) => {
    try {
      const response = await axios.get(`https://www.facebook.com/${vanity}`, {
        headers: {
          authority: "www.facebook.com",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "vi",
          "sec-ch-prefers-color-scheme": "light",
          "sec-ch-ua": '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
          "viewport-width": "1366",
        },
      });
      const text = String(response.data);
      const entityIdMatch = text.match(/entity_id":"(.*?)"/);
      const userVanityMatch = text.match(/userVanity":"(.*?)"/);
      const contentMatch = text.match(/content="fb:\/\/profile\/(.*?)"/);

      const userVanity = entityIdMatch ? vanity : userVanityMatch?.[1] || null;
      const entity_id = entityIdMatch?.[1] || contentMatch?.[1] || null;

      return {
        status: false,
        data: {
          userVanity,
          entity_id,
        },
      };
    } catch (error) {
      return {
        status: false,
        data: "Đã xảy ra lỗi!",
      };
    }
  };

  const isBot = () => (event?.senderID != api.getCurrentUserID() && event?.author != api.getCurrentUserID() ? false : true);
  const isAdmin = () => (global.client.config.ADMIN_IDS.includes(event.senderID) ? true : false);
  return { formatCurrency, isAdmin, send, reply, downloadFile, isVaildUrl, detectText, unsend, findUID, isBot };
}
