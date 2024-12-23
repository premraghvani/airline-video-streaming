const fs = require("fs");

// simply serves the script.js
module.exports = {
    page: "/script.js",
    method: "GET",
    execute: async(req, res) => {
        let body = fs.readFileSync("./static/script.js").toString();
        res.set("Content-Type", "text/javascript").send(body);
        return;
    }
};
