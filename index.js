import login from "kaguyabotfca";
import fs from "fs-extra";
import { listen } from "./listen/listen.js";
import { commandMiddleware, eventMiddleware } from "./middleware/index.js";
import sleep from "time-sleep";
import { log, notifer } from "./logger/index.js";
import gradient from "gradient-string";
import("./middleware/database.middleware.js");
import("./app.js");
import config from "./setup/config.js";
import EventEmitter from "events";
import axios from "axios";
import semver from "semver";

class Kaguya extends EventEmitter {
  constructor() {
    super();
    this.on("system:error", (err) => {
      log([
        {
          message: "[ ERROR ]: ",
          color: "red",
        },
        {
          message: `Đã xảy ra lỗi: ${err}`,
          color: "white",
        },
      ]);
      process.exit(1);
    });
    this.currentConfig = config;
    this.credentials = fs.readFileSync("./setup/credentials.json");
    this.package = JSON.parse(fs.readFileSync("./package.json"));
    this.checkCredentials();
  }

  checkCredentials() {
    try {
      const credentialsArray = JSON.parse(this.credentials);

      if (!Array.isArray(credentialsArray) || credentialsArray.length === 0) {
        this.emit("system:error", "Vui lòng đến thư mục setup/credentials.json và điền appstate vào trong!");
        process.exit(0);
      }
    } catch (error) {
      this.emit("system:error", "Không thể phân tích chuỗi credentials JSON  ở thư mục setup/credentials.json");
    }
  }
  async checkVersion() {
    try {
      const redToGreen = gradient("white", "green");
      console.log(redToGreen("■".repeat(50), { interpolation: "hsv" }));
      console.log(`${gradient(["#4feb34", "#4feb34"])("[ AUTHOR ]: ")} ${gradient("cyan", "pink")("Thiệu Trung Kiên")}`);
      console.log(`${gradient(["#4feb34", "#4feb34"])("[ GITHUB ]: ")} ${gradient("cyan", "pink")("https://github.com/ttkienn/Kaguya-Pr0ject")}`);
      var { data } = await axios.get("https://raw.githubusercontent.com/ttkienn/Kaguya-Pr0ject/master/package.json");
      if (semver.lt(this.package.version, (data.version ??= this.package.version))) {
        log([
          {
            message: "[ SYSTEM ]: ",
            color: "yellow",
          },
          {
            message: `Đã có phiên bản mới, vui lòng cập nhật tại : https://github.com/ttkienn/Kaguya-Pr0ject`,
            color: "white",
          },
        ]);
      }
      let currentFrame = 0;
      const interval = setInterval(() => {
        process.stdout.write("\b".repeat(currentFrame));
        const frame = redToGreen("■".repeat(currentFrame), { interpolation: "hsv" });
        process.stdout.write(frame);

        currentFrame++;
        if (currentFrame > 50) {
          clearInterval(interval);
          process.stdout.write("\n");
          this.emit("system:run");
        }
      }, 10);
    } catch (err) {
      this.emit("system:error", err);
    }
  }
  async start() {
    setInterval(() => {
      const t = process.uptime();
      const [i, a, m] = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)].map((num) => (num < 10 ? "0" + num : num));
      const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
      const memoryData = process.memoryUsage();
      process.title = `Kaguya Project - Author: Thiệu Trung Kiên - ${i}:${a}:${m} - External: ${formatMemoryUsage(memoryData.external)}`;
    }, 1000);

    global.client = {
      commands: new Map(),
      events: new Map(),
      cooldowns: new Map(),
      aliases: new Map(),
      handler: {
        reply: new Map(),
        reactions: new Map(),
      },
      config: this.currentConfig,
    };
    await commandMiddleware();
    await eventMiddleware();
    this.checkVersion();
    this.on("system:run", () => {
      login({ appState: JSON.parse(this.credentials) }, async (err, api) => {
        if (err) {
          this.emit("system:error", err);
        }

        api.setOptions(this.currentConfig.options);

        const listenMqtt = async () => {
          try {
            if (!listenMqtt.isListening) {
              listenMqtt.isListening = true;
              const mqtt = await api.listenMqtt(async (err, event) => {
                if (err) {
                  this.emit("system:error", err);
                }
                await listen({ api, event, client: global.client });
              });
              await sleep(this.currentConfig.mqtt_refresh);
              notifer("[ MQTT ]", "Đang tiến hành refresh mqtt !");
              log([
                {
                  message: "[ MQTT ]: ",
                  color: "yellow",
                },
                {
                  message: `Đang tiến hành refresh mqtt !`,
                  color: "white",
                },
              ]);
              await mqtt.stopListening();
              await sleep(5000);
              notifer("[ MQTT ]", "Refresh thành công!");
              log([
                {
                  message: "[ MQTT ]: ",
                  color: "green",
                },
                {
                  message: `Refresh thành công!`,
                  color: "white",
                },
              ]);
              listenMqtt.isListening = false;
            }
            listenMqtt();
          } catch (error) {
            this.emit("system:error", err);
          }
        };

        listenMqtt.isListening = false;
        listenMqtt();
      });
    });
  }
}

const KaguyaInstance = new Kaguya();
KaguyaInstance.start();
