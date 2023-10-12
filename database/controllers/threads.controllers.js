import threadsModels from "../models/threads.models.js";
import config from "../../setup/config.js";
import { log } from "../../logger/index.js";
import fs from "fs-extra";
import chokidar from "chokidar";

const filePath = "./database/threads.json";
const watcher = chokidar.watch(filePath);

var threadsJSON = JSON.parse(fs.readFileSync(filePath));

watcher.on("change", () => {
  threadsJSON = JSON.parse(fs.readFileSync(filePath));
});

export default function ({ api }) {
  const getThreadInfo = async (tid) => {
    return await api.getThreadInfo(tid);
  };
  const create = async (tid) => {
    try {
      const thread = await find(tid);

      if (thread.status) {
        return { status: true, data: "Threads đã tồn tại trên hệ thống database" };
      }

      const threadInfo = await getThreadInfo(tid);

      if (!threadInfo) {
        return { status: false, data: "Không tìm thấy thông tin của threads" };
      }

      const { threadName, imageSrc, participantIDs, adminIDs, emoji, approvalMode } = threadInfo;
      const adminIDsArr = adminIDs.map(({ id }) => id);

      const boxData =
        {
          threadID: tid,
          data: {
            name: threadName,
            threadThumbnail: imageSrc,
            members: participantIDs.length,
            adminIDs: adminIDsArr,
            emoji,
            prefix: null,
            approvalMode,
            anti: { nameBox: false, imageBox: false },
            banned: { status: false, reason: null, time: null },
          },
        } ?? {};

      var newThread;

      if (config.database.type == "json") {
        threadsJSON.push(boxData);
        fs.writeFileSync(filePath, JSON.stringify(threadsJSON, null, 2));
        newThread = threadsJSON;
      }
      if (config.database.type == "mongodb") {
        newThread = await threadsModels.create(boxData);
      }

      log([
        { message: "[ THREADS ]: ", color: "yellow" },
        { message: "Đã tạo thành công dữ liệu cho nhóm ", color: "green" },
        { message: `<${tid}> - ${threadName ?? "Nhóm không có tên"}`, color: "white" },
      ]);

      return { status: true, data: newThread };
    } catch (error) {
      console.error(error);
      return { status: false, data: null };
    }
  };

  const find = async (tid) => {
    try {
      var thread;
      switch (config.database.type) {
        case "json":
          {
            thread = threadsJSON.find((i) => i?.threadID == tid);
          }
          break;
        case "mongodb":
          {
            thread = await threadsModels.findOne({ threadID: tid });
          }
          break;
      }
      return {
        status: Boolean(thread),
        data: thread || null,
      };
    } catch (error) {
      return {
        status: false,
        data: "Đã xảy ra lỗi hệ thống!",
      };
    }
  };
  const update = async (tid, data) => {
    try {
      let thread;

      switch (config.database.type) {
        case "json":
          const threadIndex = threadsJSON.findIndex((i) => i?.threadID === tid);
          if (threadIndex === -1) {
            return { status: false, data: "thread_not_found" };
          }
          threadsJSON[threadIndex].data = { ...threadsJSON[threadIndex].data, ...data };
          fs.writeFileSync(filePath, JSON.stringify(threadsJSON, null, 2));
          break;

        case "mongodb":
          thread = await threadsModels.findOne({ threadID: tid });
          if (!thread) {
            return { status: false, data: "thread_not_found" };
          }
          thread.data = { ...thread.data, ...data };
          await thread.save();
          break;
      }

      return { status: true, data: thread || null };
    } catch (error) {
      console.error(error);
      return { status: false, data: "internal_error" };
    }
  };

  const remove = async (tid) => {
    try {
      let deletedCount = 0;

      switch (config.database.type) {
        case "json":
          const index = threadsJSON.findIndex((i) => i?.threadID === tid);
          if (index !== -1) {
            threadsJSON.splice(index, 1);
            fs.writeFileSync(filePath, JSON.stringify(threadsJSON, null, 2));
            deletedCount = 1;
          }
          break;
        case "mongodb":
          const result = await threadsModels.deleteOne({ threadID: tid });
          deletedCount = result.deletedCount;
          break;
      }

      return {
        status: deletedCount === 1,
        data: "Đã xoá thành công dữ liệu của nhóm!",
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        data: "Đã xảy ra lỗi hệ thống!",
      };
    }
  };

  const getAll = async () => {
    try {
      let allThreads = null;

      switch (config.database.type) {
        case "json":
          allThreads = threadsJSON;
          break;
        case "mongodb":
          allThreads = await threadsModels.find();
          break;
      }

      return {
        status: Boolean(allThreads),
        data: allThreads || null,
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        data: "Đã xảy ra lỗi hệ thống!",
      };
    }
  };

  const ban = async (threadID, data = { status: false, reason: null }) => {
    try {
      const thread = config.database.type === "json" ? threadsJSON.find((i) => i?.threadID === threadID) : await threadsModels.findOne({ threadID });

      if (!thread) {
        return {
          status: false,
          data: "Không tìm thấy thông tin nhóm trong hệ thống database!",
        };
      }

      if (thread.data.banned.status && data.status) {
        return {
          status: false,
          data: `Nhóm mang TID: ${threadID} đã bị ban từ trước\nLý do :${thread.data.banned.reason} `,
        };
      }

      thread.data.banned = data;

      if (config.database.type === "json") {
        const index = threadsJSON.findIndex((i) => i?.threadID === threadID);
        threadsJSON[index] = thread;
        fs.writeFileSync(filePath, JSON.stringify(threadsJSON, null, 2));
      } else if (config.database.type === "mongodb") {
        await thread.save();
      }

      return {
        status: true,
        data: `Đã ${data.status ? "ban" : "unban"} thành công nhóm mang TID: ${threadID}\nLý do :${data.reason}`,
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        data: "Đã xảy ra lỗi hệ thống!",
      };
    }
  };

  return {
    create,
    find,
    update,
    remove,
    getAll,
    ban,
  };
}
