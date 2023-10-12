import express from "express";
import config from "./setup/config.js";
import { log } from "./logger/index.js";
var app = express();

app.get("/", (req, res) => {
  res.send("<h1>Kaguya Bot is running!</h1>");
});

app.listen(config.port, () => {
  log([
    {
      message: "[ EXPRESSJS ]: ",
      color: "green",
    },
    {
      message: `Listening on port : ${config.port} `,
      color: "white",
    },
  ]);
});
