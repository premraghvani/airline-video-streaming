const fs = require("fs");

// retrieves all films in a category
module.exports = {
    page: "/film/fetchcategoryfilms",
    method: "GET",
    execute: (req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");
        let category = req.query.category;
        if(!category){
            res.status(400).send("[]");
            return;
        } else {
            category = category.toUpperCase()
        }

        // gets directory
        const films = require("../assets/index.json")
        let inCategory = [];
        for(var i = 0; i < films.length; i++){
            let q = films[i];
            if(q.genre.toUpperCase() == category){
                inCategory.push(q);
            }
        }

        res.status(200).send(JSON.stringify(inCategory));
    }
};
