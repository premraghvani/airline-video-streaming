const {readDb} = require("../commonFunctions/database");

// checks if the connection is online, and returns messages
module.exports = {
    page: "/message/fetch",
    method: "GET",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // date now
        const d = new Date();
        const timeNow = Math.floor(d.getTime() / 1000)
        
        // gets messages
        let messagesTmp = await readDb("main","messages")

        // checks if there exists the messages
        if(messagesTmp === false){
            res.status(500).send({message:"Couldn't find the messages, server error."});
            return;
        }

        // filters for last 30 seconds
        let messages = [];
        for(var i = 0; i < messagesTmp.length; i++){
            let q = messagesTmp[i];
            if(q.timestamp >= (timeNow - 30)){
                messages.push(q);
            }
        }

        res.status(200).send({alive:true,messages});
        return;
    }
};
