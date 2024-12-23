const {readDb} = require("../commonFunctions/database");

// simply serves the flight data
module.exports = {
    page: "/flight",
    method: "GET",
    execute: async(req, res) => {
        let body = await readDb("main","flightData")
        res.set("Content-Type", "application/json");

        if(body === false){
            res.status(500).send({message:"Couldn't find flight data"})
        } else {
            res.status(200).send(body);
        }
        return;
    }
};
