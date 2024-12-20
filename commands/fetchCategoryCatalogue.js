const {readDb} = require("../commonFunctions/database");

// retrieves a list of all film categories
module.exports = {
    page: "/film/category/fetch",
    method: "GET",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // retrieves
        let films = require("../assets/index.json");

        // error case
        if(films == false){
            res.status(500).send({"error":"Couldn't find the films in the system, sorry."});
            return;
        }

        // filters for films
        let filmsInCategories = {};
        for(var i = 0; i < films.length; i++){
            let cat = films[i].genre.toLowerCase();
            if(!filmsInCategories[cat]){
                filmsInCategories[cat] = [];
            }
            filmsInCategories[cat].push(films[i]);
        }
        let categories = Object.keys(filmsInCategories).sort();

        // returns data
        res.status(200).send(JSON.stringify({categories}));
        return;
    }
};
