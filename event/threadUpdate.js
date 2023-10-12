import { log } from "../logger/index.js";
export default {
  name: "threadUpdate",
  execute: async ({ api, event, Threads }) => {
    const threads = (await Threads.find(event.threadID))?.data?.data || {};
    if(!threads){
      await Threads.create(event.threadID)
    }
    if (!Object.keys(threads).length) return;
    switch (event.logMessageType) {
      case "log:thread-name":
        {
          var { name: oldName = null } = threads;
          var { name: newName } = event.logMessageData;
          if (threads.anti?.nameBox) {
            await api.setTitle(oldName, event.threadID, (err) => {
              if (err) console.log(err);
            });
          }
         await Threads.update(event.threadID, {
            name: newName,
          });
          log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: "Đã cập nhật tên mới cho nhóm ",
              color: "green",
            },
            {
              message: `<${event.threadID}> - ${newName}`,
              color: "white",
            },
          ]);
        }
        break;
      case "change_thread_admins":
        {
          const { adminIDs = [] } = threads;
          const { TARGET_ID, ADMIN_EVENT } = event.logMessageData;
          if (ADMIN_EVENT == "add_admin" && !adminIDs.includes(TARGET_ID)) {
            adminIDs.push(TARGET_ID);
          }
          if (ADMIN_EVENT == "remove_admin") {
            const indexOfTarget = adminIDs.indexOf(TARGET_ID);
            if (indexOfTarget > -1) {
              adminIDs.splice(indexOfTarget, 1);
            }
          }
          await Threads.update(event.threadID, {
            adminIDs,
          });
          log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: `Đã ${ADMIN_EVENT == "add_admin" ? "thêm" : "gỡ"} 1 quản trị viên cho nhóm `,
              color: "green",
            },
            {
              message: `<${event.threadID}> - ${threads.name}`,
              color: "white",
            },
          ]);
        }
        break;
      case "change_thread_approval_mode": {
        const { APPROVAL_MODE } = event.logMessageData;
        await Threads.update(event.threadID, {
          approvalMode: APPROVAL_MODE == 0 ? false : true,
        });
        log([
          {
            message: "[ THREADS ]: ",
            color: "yellow",
          },
          {
            message: `Đã ${APPROVAL_MODE == 0 ? "tắt" : "bật"} chế độ phê duyệt cho nhóm `,
            color: "green",
          },
          {
            message: `<${event.threadID}> - ${threads.name}`,
            color: "white",
          },
        ]);
      }
      case "log:thread-icon": {
        const { thread_icon } = event.logMessageData;
        await Threads.update(event.threadID, {
            emoji: thread_icon
        })
        return kaguya.reply(event.logMessageBody)
      }
    }
  },
};
