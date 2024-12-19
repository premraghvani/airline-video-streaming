const fs = require("fs");

// simply serves the plyr-3.7.8.js
module.exports = {
    page: "/plyr.js",
    method: "GET",
    execute: async(req, res) => {
        let body = fs.readFileSync("./static/plyr-3.7.8.js").toString();
        res.set("Content-Type", "text/javascript");
        res.send(body);
        return;
    }
};
