const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");
const fs = require("fs")

// admins to update a film
module.exports = {
    page: "/film/individual/edit",
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

        
        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }

        // gets current metadata
        if(!body.id){
            res.status(400).send({error:"Must provide movie ID"});
            return;
        }
        let metadata = await readDb("metadata",body.id);
        if(metadata === false){
            res.status(404).send({error:"Movie not found"});
            return;
        }
        
        // input validation and puts new data
        if(!!body.title){
            if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.title) === false){
                res.status(400).send({error:"Provided movie title is invalid"});
                return;
            } else {
                metadata.title = body.title;
            }
        } 

        if(!!body.description){
            if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.description) === false){
                res.status(400).send({error:"Provided movie description is invalid"});
                return;
            } else {
                metadata.description = body.description;
            }
        } 

        if(!!body.genre){
            if(/^[A-Za-z]+$/.test(body.genre) === false){
                res.status(400).send({error:"Provided movie genre is invalid"});
                return;
            } else {
                // adjusts capitalisation of genre before adding
                body.genre = body.genre.toLowerCase()
                let tmp = body.genre.split("");
                tmp[0] = tmp[0].toUpperCase();
                metadata.genre = tmp.join("")
            }
        }

        if(!!body.year){
            if(Number.isInteger(body.year) === false || body.year <= 0){
                res.status(400).send({error:"Provided movie year is invalid"});
                return;
            } else {
                metadata.year = body.year;
            }
        }

        if(!!body.cast){
            if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.cast) === false){
                res.status(400).send({error:"Provided movie cast is invalid"});
                return;
            } else {
                metadata.cast = body.cast;
            }
        } 

        if(!!body.director){
            if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.director) === false){
                res.status(400).send({error:"Provided movie director is invalid"});
                return;
            } else {
                metadata.director = body.director;
            }
        } 
        
        // updating if there should be metadata change
        if(metadata.acceptingChange == undefined){
            metadata.acceptingChange = {
                thumbnail:false,
                video:false
            }
        }

        if(body.newThumbnail != undefined && body.newThumbnail === true){
            metadata.acceptingChange.thumbnail = true;
            if(fs.existsSync(`./assets/thumbnails/${metadata.id}.jpg`)){
                fs.unlinkSync(`./assets/thumbnails/${metadata.id}.jpg`)
            }
        }

        if(body.newVideo != undefined && body.newVideo === true){
            metadata.acceptingChange.video = true;
            if(fs.existsSync(`./assets/videos/${metadata.id}.mp4`)){
               fs.unlinkSync(`./assets/videos/${metadata.id}.mp4`)
            }
        }

        if(metadata.acceptingChange.thumbnail === false && metadata.acceptingChange.video === false){
            metadata.acceptingChange = undefined;
        }

        // gets index, checks for valid number
        let currIndex = await readDb("main","index");

        if(currIndex === false){
            res.status(500).send(JSON.stringify({error:"Could not access index - server messed up"}))
            return;
        }

        // finds the index item and changes accordingly
        for(var i = 0; i < currIndex.length; i++){
            let q = currIndex[i];
            if(q.id == metadata.id){
                currIndex[i] = {
                    id: metadata.id,
                    title: metadata.title,
                    genre: metadata.genre,
                    year: metadata.year
                }
            }
        }
        await writeDb("main","index",currIndex)


        // commits metadata change
        await writeDb("metadata",metadata.id.toString(),metadata)

        res.status(200).send({message:"Success!"})

    }
};