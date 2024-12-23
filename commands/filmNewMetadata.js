const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");

// admins to delete the film(s)
module.exports = {
    page: "/film/individual/new/metadata",
    method: "POST",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // finds body
        let body;
        try {
            body = JSON.parse(req.body.toString())
        } catch(err){
            body = {}
        }

        // input validation
        if(!body.title || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.title) === false){
            res.set(400).send({error:"Invalid / no movie title provided"});
            return;
        }
        if(!body.description || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.description) === false){
            res.set(400).send({error:"Invalid / no movie description provided"});
            return;
        }
        if(!body.genre || /^[A-Za-z]+$/.test(body.genre) === false){
            res.set(400).send({error:"Invalid / no genre provided"});
            return;
        }
        if(!body.year || Number.isInteger(body.year) === false || body.year <= 0){
            res.set(400).send({error:"Invalid / no year provided"});
            return;
        }
        if(!body.cast || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.cast) === false){
            res.set(400).send({error:"Invalid / no cast provided"});
            return;
        }
        if(!body.director || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.director) === false){
            res.set(400).send({error:"Invalid / no movie director provided"});
            return;
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }

        // adjusts capitalisation of genre
        body.genre = body.genre.toLowerCase()
        let tmp = body.genre.split("");
        tmp[0] = tmp[0].toUpperCase();
        body.genre = tmp.join("")

        // gets index, checks for valid number
        let currIndex = await readDb("main","index");

        if(currIndex === false){
            res.status(500).send(JSON.stringify({error:"Could not access index - server messed up"}))
            return;
        }

        let latestIndex = currIndex[currIndex.length - 1].id
        let approvedIndex = false;

        // checks that it is truly free
        while(approvedIndex == false){
            let item = await readDb("metadata",latestIndex.toString());
            if(item === false){
                approvedIndex = true;
            } else {
                latestIndex += 1;
            }
        }

        // if it is available, add its metadata into index
        let indexObject = {
            id: latestIndex,
            title: body.title,
            genre: body.genre,
            year: body.year
        }
        currIndex.push(indexObject);
        await writeDb("main","index", currIndex);

        // now puts it into metadata
        let metadataObject = {
            id: latestIndex,
            title: body.title,
            genre: body.genre,
            year: body.year,
            cast: body.cast,
            director: body.director,
            description: body.description,
            acceptingChange:{
                thumbnail:true,
                video:true
            }
        }

        await writeDb("metadata",metadataObject.id.toString(),metadataObject)

        // creates reviews
        await writeDb("reviews",metadataObject.id.toString(),[])

        res.status(200).send({message:"Success!",id:metadataObject.id})

    }
};