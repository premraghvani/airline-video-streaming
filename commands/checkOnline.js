const fs = require("fs");

// checks if the connection is online
module.exports = {
    page: "/isonline",
    method: "GET",
    execute: (req, res) => {
        res.set("Content-Type", "application/json");

        // date now
        const d = new Date();
        const timeNow = Math.floor(d.getTime() / 1000)
        
        // gets messages in last 20 seconds
        let messagesTmp = require("../assets/messages.json");
        let messages = [];
        for(var i = 0; i < messagesTmp.length; i++){
            let q = messagesTmp[i];
            if(q.timestamp >= (timeNow - 20)){
                messages.push(q);
            }
        }

        res.send(`{\"alive\":true,\"messages\":${JSON.stringify(messages)}}`);
    }
};
