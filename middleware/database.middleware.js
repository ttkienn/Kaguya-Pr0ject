import mongoose from "mongoose";
import config from "../setup/config.js";
import { log } from "../logger/index.js";
import fs from "fs";
(async () => {
  switch (config.database.type) {
    case "mongodb":
      {
        try {
          await mongoose.connect(config.database.mongodb.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        } catch (error) {
          console.log(error);
          log([
            {
              message: "[ DATABASE ]: ",
              color: "red",
            },
            {
              message: "Không thể kết nối đến database",
              color: "white",
            },
          ]);
          process.exit(0);
        }
      }
      break;
    case "json":
      {
        const createIfNotExists = (path) => {
          if (!fs.existsSync(path)) fs.writeFileSync(path, "[]");
        };

        createIfNotExists("./database/users.json");
        createIfNotExists("./database/threads.json");
      }
      break;
  }
  log([
    {
      message: "[ DATABASE ]: ",
      color: "green",
    },
    {
      message: "Đã kết nối đến database",
      color: "white",
    },
  ]);
})();
