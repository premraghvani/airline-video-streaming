const fs = require("fs");
const config = require("../config.json");

// simply serves the front html page
module.exports = {
  page: "/",
  method: "GET",
  execute: async (req, res) => {
    let body = fs.readFileSync("./static/main.html").toString();
    res.set("Content-Type", "text/html").send(body);
    return;
  }
};