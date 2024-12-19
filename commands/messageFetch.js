const {readDatabase} = require("../commonFunctions/databaseRead")

// checks if the connection is online, and returns messages
module.exports = {
    page: "/message/fetch",
    method: "GET",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // date now
        const d = new Date();
        const timeNow = Math.floor(d.getTime() / 1000)
        
        // gets messages in last 20 seconds
        let messagesTmp = await readDatabase("main","messages")
        let messages = [];
        for(var i = 0; i < messagesTmp.length; i++){
            let q = messagesTmp[i];
            if(q.timestamp >= (timeNow - 20)){
                messages.push(q);
            }
        }

        res.send(JSON.stringify({alive:true,messages}));
        return;
    }
};
