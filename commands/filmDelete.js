const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");
const { deleteFilmRecord } = require("../commonFunctions/purge")
const fs = require("fs");

// admins to delete the film(s)
module.exports = {
    page: "/film/individual/delete",
    method: "POST",
    execute: async(req, res) => {
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
            res.status(400).send({message:"Invalid / no movie ID provided"});
            return;
        }
        if(!body.title || /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/.test(body.title) === false){
            res.status(400).send({message:"Invalid / no movie title provided"});
            return;
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send({message:"Must be authenticated as an admin"});
            return;
        }
        
        // checks if the movie is correct
        let movie = await readDb("metadata",body.id);
        if(movie === false){
            res.status(404).send({message:"Movie does not exist"});
            return;
        }
        if(movie.title != body.title){
            res.status(406).send({message:"Incorrect movie title given"})
            return;
        }

        // starts deleting in order: index, metadata, reviews, thumbmail, movie.
        await deleteFilmRecord(body.id)
        

        res.status(200).send({message:"Success!"})

    }
};