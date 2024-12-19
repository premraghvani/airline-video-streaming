const fs = require("fs");

// simply serves the plyr-3.7.8.css
module.exports = {
    page: "/plyr.css",
    method: "GET",
    execute: async(req, res) => {
        let body = fs.readFileSync("./static/plyr-3.7.8.css").toString();
        res.set("Content-Type", "text/css");
        res.send(body);
        return;
    }
};
