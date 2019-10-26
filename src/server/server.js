const express = require("express");
const chalk = require("chalk");
const app = express();
const port = 3000;
var { token } = require("../../index");

app.set("view engine", "pug");

app.get("/authorize", (req, res) => res.render("authorize"));

app.post("/authorize/:token", (req, res) => {
  process.env.TOKEN = req.params.token;
  console.log(`${chalk.gray(">")} Logged into Spotify.`);
  res.send("");
});

app.listen(port);
