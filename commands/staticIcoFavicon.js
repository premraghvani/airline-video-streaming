const fs = require("fs");

// simply serves the favicon.ico
module.exports = {
  page: "/favicon.ico",
  method: "GET",
  execute: async (req, res) => {
    let body = fs.readFileSync("./static/favicon.ico");
    res.set("Content-Type", "image/x-icon").send(body);
    return;
  }
};