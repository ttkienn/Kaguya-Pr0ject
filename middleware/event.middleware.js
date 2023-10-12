import fs from "fs-extra";
import { log } from "../logger/index.js";
export const eventMiddleware = async () => {
  try {
    const dir = await fs.readdir("./event");
    for (const event of dir) {
      if (!event.endsWith(".js")) {
        continue;
      }
      const events = (await import(`../event/${event}`)).default;
      if (events?.onLoad && typeof events?.onLoad == "function") {
        await events.onLoad();
      }
      if (!events?.name) {
        log([
          {
            message: "[ EVENT ]: ",
            color: "yellow",
          },
          {
            message: `Không thể tải sự kiện : ${event} vì không có tên sự kiện`,
            color: "red",
          },
        ]);
        continue;
      }
      if (typeof events?.execute !== "function") {
        log([
          {
            message: "[ EVENT ]: ",
            color: "yellow",
          },
          {
            message: `Không thể tải sự kiện : ${event} vì không có hàm thực thi`,
            color: "red",
          },
        ]);
        continue;
      }
      await global.client.events.set(events.name, events);
      await log([
        {
          message: "[ EVENT ]: ",
          color: "yellow",
        },
        {
          message: `Đã tải thành công sự kiện : ./event/${events.name}`,
          color: "white",
        },
      ]); 
    }
  } catch (error) {
    log([
      {
        message: "[ EVENT ]: ",
        color: "yellow",
      },
      {
        message: `Không thể tải sự kiện do lỗi : ${error}`,
        color: "red",
      },
    ]);
  }
};
