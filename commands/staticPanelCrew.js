const fs = require("fs");

// simply serves the crew's html page
module.exports = {
  page: "/crew",
  method: "GET",
  execute: async (req, res) => {
    let body = fs.readFileSync("./static/crew.html").toString();
    res.set("Content-Type", "text/html").send(body);
    return;
  }
};