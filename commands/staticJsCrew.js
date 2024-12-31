const fs = require("fs");

// simply serves the scriptCrew.js
module.exports = {
  page: "/scriptCrew.js",
  method: "GET",
  execute: async (req, res) => {
    let body = fs.readFileSync("./static/scriptCrew.js").toString();
    res.set("Content-Type", "text/javascript").send(body);
    return;
  }
};