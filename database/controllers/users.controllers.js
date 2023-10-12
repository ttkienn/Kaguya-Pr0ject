import userModels from "../models/users.models.js";
import { log } from "../../logger/index.js";
import config from "../../setup/config.js";
import fs from "fs-extra";
import chokidar from "chokidar";

const databaseType = config.database.type;
const filePath = "./database/users.json";
const watcher = chokidar.watch(filePath);

var usersData = JSON.parse(fs.readFileSync(filePath));

watcher.on("change", () => {
  usersData = JSON.parse(fs.readFileSync(filePath));
});

export default function ({ api }) {
  const getUserInfo = async (uid) => {
    const data = await api.getUserInfo(uid);
    return data?.[uid] ?? null;
  };

  const find = async (uid) => {
    try {
      let user;

      if (databaseType === "json") {
        user = usersData.find((i) => i?.uid == uid);
      }
      if (databaseType === "mongodb") {
        user = await userModels.findOne({ uid });
      }

      return {
        status: Boolean(user),
        data: user || null,
      };
    } catch (error) {
      return {
        status: false,
        data: "Đã xảy ra lỗi hệ thống!",
      };
    }
  };

  const remove = async (uid) => {
    try {
      let deletedCount;

      if (databaseType === "json") {
        const index = usersData.findIndex((i) => i?.uid === uid);
        if (index !== -1) {
          usersData.splice(index, 1);
          fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
          deletedCount = 1;
        }
      } else if (databaseType === "mongodb") {
        const result = await userModels.deleteOne({ uid });
        deletedCount = result.deletedCount;
      }

      return {
        status: deletedCount === 1,
        data: "Xoá dữ liệu người dùng thành công",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
      };
    }
  };

  const create = async (uid) => {
    try {
      // Validate that uid is provided and not empty
      if (!uid) {
        return {
          status: false,
          data: "UID is required to create a user.",
        };
      }
  
      const user = await find(uid);
  
      if (user.status) {
        return {
          status: false,
          data: "Người dùng đã tồn tại trong hệ thống database!",
        };
      }
  
      const userData = await getUserInfo(uid);
  
      const dataUser = {
        uid,
        data: {
          money: 0,
          exp: 0,
          level: 0,
          banned: {
            status: false,
            reason: "",
            time: 0,
          },
          name: userData?.name || "",
          firstName: userData?.firstName || "",
          vanity: userData?.vanity || "",
          avatar: `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          type: userData?.type || "",
          profileUrl: userData?.profileUrl || "",
          isFriend: userData?.isFriend || false,
          isBirthday: userData?.isBirthday || false,
          gender: userData?.gender == 2 ? "Nam" : userData?.gender == 1 ? "Nữ" : "Không xác định",
          other: {},
        },
      };
  
      let newUser;
  
      if (databaseType === "json") {
        usersData.push(dataUser);
        fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
        newUser = usersData;
      } 
      if (databaseType === "mongodb") {
        newUser = await userModels.create(dataUser);
      }
  
      log([
        {
          message: "[ USER ] : ",
          color: "yellow",
        },
        {
          message: `Đã tạo thành công dữ liệu cho user `,
          color: "green",
        },
        {
          message: `<${uid}> - ${userData?.name}`,
          color: "white",
        },
      ]);
  
      return {
        status: true,
        data: newUser,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        data: null,
      };
    }
  };
  

  const update = async (uid, data) => {
    try {
      let user;

      if (databaseType === "json") {
        const index = usersData.findIndex((i) => i?.uid === uid);
        if (index !== -1) {
          usersData[index].data = { ...usersData[index].data, ...data };
          fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
          user = usersData[index];
        }
      } else if (databaseType === "mongodb") {
        const filter = { uid };
        user = await userModels.findOne(filter);
        if (user) {
          user.data = { ...user.data, ...data };
          await user.save();
        }
      }

      return {
        status: Boolean(user),
        data: user || null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
      };
    }
  };

  const getAll = async () => {
    try {
      let allUsers;

      if (databaseType === "json") {
        allUsers = usersData;
      } else if (databaseType === "mongodb") {
        allUsers = await userModels.find();
      }

      return {
        status: Boolean(allUsers),
        data: allUsers || null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
      };
    }
  };

  const ban = async (uid, data = { status: false, reason: null }) => {
    try {
      let user;

      if (databaseType === "json") {
        const index = usersData.findIndex((i) => i?.uid === uid);
        if (index !== -1) {
          user = usersData[index];
          user.data.banned = data;
          fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
        }
      } else if (databaseType === "mongodb") {
        user = await userModels.findOne({ uid });
        if (user) {
          user.data.banned = data;
          await user.save();
        }
      }

      return {
        status: Boolean(user),
        data: user?.data?.banned || null,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        data: "Xảy ra lỗi hệ thống!",
      };
    }
  };

  return {
    create,
    find,
    remove,
    update,
    getAll,
    ban,
  };
}
