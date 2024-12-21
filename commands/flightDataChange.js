const {readDb, writeDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// canin crew to send a message
module.exports = {
    page: "/flight/data",
    method: "POST",
    execute: async(req, res) => {
        // finds data
        let body;
        try {
            body = JSON.parse(req.body.toString())
        } catch(err){
            body = {}
        }

        let validateUser = await validate(req.cookies.token);
        if(validateUser.approval === false){
            res.status(403).send(JSON.stringify({error:"Must be authenticated"}))
            return;
        }

        // gets the flight data
        let flightData = await readDb("main","flightData");

        if(flightData===false){
            res.status(500).send({error:"Failure finding flight data"});
            return;
        }

        // data validation
        const iataRegex = /^[A-Za-z]{3}$/
        const otherRegex = /^[A-Za-z0-9 ]+$/

        if(!!body.origin){
            if(otherRegex.test(body.origin) === false){
                res.status(400).send({error:"Invalid origin"});
                return;
            } else {
                flightData.origin = body.origin;
            }
        }

        if(!!body.destination){
            if(otherRegex.test(body.destination) === false){
                res.status(400).send({error:"Invalid destination"});
                return;
            } else {
                flightData.destination = body.destination;
            }
        }

        if(!!body.flightNum){
            if(otherRegex.test(body.flightNum) === false){
                res.status(400).send({error:"Invalid flightNum"});
                return;
            } else {
                flightData.flightNum = body.flightNum;
            }
        }

        if(!!body.originCode){
            if(iataRegex.test(body.originCode) === false){
                res.status(400).send({error:"Invalid originCode"});
                return;
            } else {
                flightData.originCode = body.originCode.toUpperCase();
            }
        }

        if(!!body.destinationCode){
            if(iataRegex.test(body.destinationCode) === false){
                res.status(400).send({error:"Invalid destinationCode"});
                return;
            } else {
                flightData.destinationCode = body.destinationCode.toUpperCase();
            }
        }

        // implements changes
        await writeDb("main","flightData",flightData)

        // confirms
        res.status(200).send(JSON.stringify({message:"Success!"}));
        return;
    }
};