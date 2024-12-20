const {readDb, writeDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// admins to review the films
module.exports = {
    page: "/review/approvals",
    method: "POST",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // finds data
        let rawBody = req.body;
        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());
        
        if(!body.movieId || (!body.deletion && !body.approvals)){
            res.status(400).send(JSON.stringify({error:"Specify either deletions, approvals or both, and movie ID"}));
            return;
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }

        // checks if movie exists
        let reviews = await readDb("reviews",body.movieId); 
        if(reviews == false){
            res.status(404).send(JSON.stringify({error:"Movie does not exist"}));
            return;
        }

        // figures out what is to be done
        if(!body.approvals){body.approvals = []};
        if(!body.deletion){body.deletion = []};
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        let decisionsToMake = {};

        // finds all valid UUIDs for approvals
        for(var i = 0; i < body.approvals.length; i++){
            let q = body.approvals[i];
            if(uuidRegex.test(q) == true){
                decisionsToMake[q] = "approve"
            }
        }

        // finds all valid UUIDs for deletions
        for(var i = 0; i < body.deletion.length; i++){
            let q = body.deletion[i];
            if(uuidRegex.test(q) == true){
                decisionsToMake[q] = "delete"
            }
        }

        // takes action on each one
        let reviewsFinal = [];
        for(var i = 0; i < reviews.length; i++){
            let q = reviews[i];
            if(decisionsToMake[q.id] == "approve"){
                // approved
                q.approved = true;
                reviewsFinal.push(q)
            } else if(decisionsToMake[q.id] == "delete"){
                // does not consider
            } else {
                // adds it in but in its current state
                reviewsFinal.push(q)
            }
        }

        // updates reviews
        await writeDb("reviews",body.movieId,reviewsFinal);
        res.status(200).send(JSON.stringify({success:"Changes made"}))
    }
};