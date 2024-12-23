const {readDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// retrieves reviews (all of them, restricted)
module.exports = {
    page: "/review/fetch/all",
    method: "GET",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // checks input
        let id = req.query.id;
        if(!id || /^[0-9]+$/.test(id) === false){
            res.status(400).send({message:"Invalid id"});
            return;
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send({message:"Must be authenticated as an admin"});
            return;
        }

        // fetches reviews
        let rawData = await readDb("reviews",id);
        if(rawData === false){
            res.status(404).send({message:"Movie does not exist"});
            return;
        }
        
        // sends back all data
        res.status(200).send(rawData)
        return;
    }
};
