const fs = require("fs");

// checks if the connection is online
module.exports = {
    page: "/isonline",
    method: "GET",
    execute: (req, res) => {
        res.set("Content-Type", "application/json");
        res.send("{\"alive\":true}");
    }
};
