import axios from "axios";
import ytdl from "ytdl-core";
import fs from "fs";
class Sing {
  name = "sing";
  author = "Thiệu Trung Kiên";
  cooldowns = 10;
  description = "Có lẽ là nghe nhạc trên messenger ?";
  role = "member";
  aliases = ["audio", "mp3", "music"];
  getImg = [[], [], []];
  isYouTubeLink = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(url);
  parseDurationInSeconds(duration) {
    const [hours, minutes, seconds] = duration.split(':').map(part => parseInt(part) || 0);
    return hours * 3600 + minutes * 60 + seconds;
  }
  async execute({ api, event, args }) {
    try {
      const KeywordsOrLink = args.join(" ");
      const isYouTube = this.isYouTubeLink(KeywordsOrLink);
      if (!KeywordsOrLink && !isYouTube) {
        return kaguya.reply("Vui lòng nhập từ khoá hoặc link nhạc !");
      }
      if (!isYouTube) {
        const {
          data: { results = [] },
        } = await axios.get(encodeURI(`https://ditmemaykkkk.com/api/youtube/search?query=${KeywordsOrLink}`));
        if (!results.length) {
          return kaguya.reply(`Không tìm thấy kết quả nào cho từ khoá : ${KeywordsOrLink}`);
        }
        let message = "";
        let sequenceNumber = 1;
        for (let i = 0; i < results.length && i <= 10; i++) {
          const result = results[i];
          const music = result.video;
          if (music && music.title) {
            const durationInSeconds = this.parseDurationInSeconds(music.duration);
            if (durationInSeconds > 1 * 60 * 60) {
              continue;
            }
            message += `${sequenceNumber}. ${music.title}\nĐộ dài : ${music.duration}\nThời gian đăng : ${music.upload_date}\n\n`;
            const path = `./cache/other/sing_${event.senderID}_${Math.random()}.jpg`;
            const { data: img } = await axios.get(result.video.thumbnail_src, {
              responseType: "arraybuffer",
            });
            fs.writeFileSync(path, Buffer.from(img));
            this.getImg = [[...this.getImg[0], fs.createReadStream(path)],[...this.getImg[1], path],[...this.getImg[2], result],];
            sequenceNumber++;
          }
        }
        api.sendMessage(
          {
            body: message,
            attachment: this.getImg[0],
          },
          event.threadID,
          (err, callback) => {
            if (err) return;
            client.handler.reply.set(callback.messageID, {
              name: this.name,
              author: event.senderID,
              musicData: this.getImg[2],
              type: "choose",
            });
            this.getImg[1].forEach((link) => fs.unlinkSync(link));
          }
        );
      } else {
        await this.downloadMusic(api, event, KeywordsOrLink);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async downloadMusic(api, event, url, title = "") {
    const path = `./cache/other/sing_${Math.random()}.mp3`;
    try {
      await new Promise((resolve, reject) => {
        const musicStream = ytdl(url, {
          quality: "lowestaudio",
        });
        const writeStream = fs.createWriteStream(path);
        musicStream.on("end", resolve);
        musicStream.on("error", (error) => {
          reject(error);
        });
        musicStream.pipe(writeStream);
      });
      api.sendMessage(
        {
          body: title,
          attachment: fs.createReadStream(path),
        },
        event.threadID,
        (err) => {
          if (err) {
            console.error("Lỗi khi gửi tin nhắn:", err);
          }
          fs.unlinkSync(path);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return kaguya.reply("Đã xảy ra lỗi, không thể tải nhạc !");
    }
  }
  async onReply({ api, event, reply }) {
    if (reply.type === "choose") {
      const chooseIndex = parseInt(event.body - 1);
      if (isNaN(chooseIndex) || chooseIndex < 0 || chooseIndex >= reply.musicData.length) {
        return kaguya.reply("Lựa chọn không hợp lệ!");
      }
      const selectedMusicData = reply.musicData[chooseIndex];
      await this.downloadMusic(api, event, selectedMusicData.video.url, selectedMusicData.video.title);
    }
  }
}
export default new Sing();
