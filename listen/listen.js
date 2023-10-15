import { CommandHandler } from "../handler/handlers.js";
import { threadsController, usersController, economyControllers, expControllers } from "../database/controllers/index.js";
import { utils } from "../helper/index.js";

/**
 * Tạo một trình xử lý sự kiện với các đối tượng và đối số cụ thể.
 * @param {object} api - Đối tượng API.
 * @param {object} event - Sự kiện cụ thể.
 * @param {object} User - Đối tượng người dùng.
 * @param {object} Thread - Đối tượng chủ đề.
 * @param {object} Economy - Đối tượng kinh tế.
 * @param {object} Exp - Đối tượng kinh nghiệm.
 * @returns {CommandHandler} - Trình xử lý lệnh.
 */
const createHandler = (api, event, User, Thread, Economy, Exp) => {
  const args = { api, event, Users: User, Threads: Thread, Economy, Exp };
  return new CommandHandler(args);
};

/**
 * Xử lý sự kiện chính.
 * @param {object} options - Các tùy chọn xử lý sự kiện.
 */
const listen = async ({ api, event }) => {
  try {
    const { threadID, senderID, type, userID, from, isGroup } = event;
    const Thread = threadsController({ api });
    const User = usersController({ api });
    const Economy = economyControllers({ api, event });
    const Exp = expControllers({ api, event });

    if (["message", "message_reply", "message_reaction", "typ"].includes(type)) {
      if (isGroup) {
        await Thread.create(threadID);
      }
      await User.create(senderID || userID || from);
    }

    global.kaguya = utils({ api, event });

    const handler = createHandler(api, event, User, Thread, Economy, Exp);
    handler.handleEvent();

    switch (type) {
      case "message":
        await handler.handleCommand();
        break;
      case "message_reaction":
        await handler.handleReaction();
        break;
      case "message_reply":
        await handler.handleReply();
        await handler.handleCommand();
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
  }
};

export { listen };
