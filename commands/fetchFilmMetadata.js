const fs = require("fs");

// checks if the connection is online
module.exports = {
    page: "/film/fetchmetadata",
    method: "GET",
    execute: (req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // checks if file exists
        let id = req.query.id;
        let fileExists = fs.existsSync(`./assets/metadata/${id}.json`);

        if(fileExists){
            // sends data if it exists
            res.status(200);
            let data = fs.readFileSync(`./assets/metadata/${id}.json`).toString();
            res.send(data);
        } else {
            res.status(404);
        }
    }
};
