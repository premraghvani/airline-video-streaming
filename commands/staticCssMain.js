const fs = require("fs");

// simply serves the style.css
module.exports = {
  page: "/style.css",
  method: "GET",
  execute: async (req, res) => {
    let body = fs.readFileSync("./static/style.css").toString();
    res.set("Content-Type", "text/css").send(body);
    return;
  }
};