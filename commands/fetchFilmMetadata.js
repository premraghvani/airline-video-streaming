const {readDatabase} = require("../commonFunctions/databaseRead");

// retrieves metadata
module.exports = {
    page: "/film/individual/metadata",
    method: "GET",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // retrieves data
        let data = await readDatabase("metadata",req.query.id)

        // response depending on if it exists
        if(data == false){
            // does not exist
            res.status(404);
            res.send({});
        } else {
            // sends data if it exists
            res.status(200);
            res.send(data);
        }
        return;
    }
};
