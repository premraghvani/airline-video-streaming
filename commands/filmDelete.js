const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");
const fs = require("fs");

// admins to delete the film(s)
module.exports = {
    page: "/film/individual/delete",
    method: "POST",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // finds data
        let body;
        try {
            body = JSON.parse(req.body.toString())
        } catch(err){
            body = {}
        }

        // input validation
        if(!body.id || /^[0-9]+$/.test(body.id) === false){
            res.set(400).send({error:"Invalid / no movie ID provided"})
        }
        if(!body.title || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(body.title) === false){
            res.set(400).send({error:"Invalid / no movie title provided"})
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }
        
        // checks if the movie is correct
        let movie = await readDb("metadata",body.id);
        if(movie === false){
            res.status(404).send(JSON.stringify({error:"Movie does not exist"}))
            return;
        }
        if(movie.title != body.title){
            res.status(406).send(JSON.stringify({error:"Incorrect movie title given"}))
            return;
        }

        // starts deleting in order: index, metadata, reviews, thumbmail, movie.

        // index reammendment
        let newIndex = [];
        let currIndex = await readDb("main","index");
        const movieIdInt = parseInt(body.id)
        for(var i = 0; i < currIndex.length; i++){
            let q = currIndex[i];
            if(q.id != movieIdInt){
                newIndex.push(q);
            }
        }
        await writeDb("main","index",newIndex)

        // metadata deletion
        if(fs.existsSync(`./assets/metadata/${movieIdInt}.json`)){
            fs.unlinkSync(`./assets/metadata/${movieIdInt}.json`)
        }

        // reviews deletion
        if(fs.existsSync(`./assets/reviews/${movieIdInt}.json`)){
            fs.unlinkSync(`./assets/reviews/${movieIdInt}.json`)
        }

        // thumbnail deletion
        if(fs.existsSync(`./assets/thumbnails/${movieIdInt}.jpg`)){
            fs.unlinkSync(`./assets/thumbnails/${movieIdInt}.jpg`)
        }

        // video deletion
        if(fs.existsSync(`./assets/videos/${movieIdInt}.mp4`)){
            fs.unlinkSync(`./assets/videos/${movieIdInt}.mp4`)
        }

        res.status(200).send({message:"Success!"})

    }
};