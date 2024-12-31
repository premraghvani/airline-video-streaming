// loads all node dependencies
const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");

// configures the app
const app = express();
app.use(express.raw({ type: "*/*", limit: "10mb" }));
app.use(cookieParser());

// loads all local modules and config
const { purgeIrrelevance } = require("./commonFunctions/purge");

// loads up a reference to all commands
const modules = fs
  .readdirSync("./commands")
  .map((file) => require(`./commands/${file}`));
let moduleList = Object.keys(modules);

// allocates different paths of API to different commands
for (var i = 0; i < moduleList.length; i++) {
  let module = modules[moduleList[i]];
  app[module.method.toLowerCase()](module.page, module.execute);
}

// asks to purge all films with no video or thumbnail as well as messages
purgeIrrelevance();

// 404 page
app.get("*", function (req, res) {
  res.status(404);
  if (req.accepts("html")) {
    let errorPage = fs.readFileSync("./static/404.html").toString();
    res.set("Content-Type", "text/html").send(errorPage);
  } else {
    res.send(null);
  }
});

// export the app function
module.exports = { app };