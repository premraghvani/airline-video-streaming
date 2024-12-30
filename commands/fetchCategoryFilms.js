const {readDb} = require("../commonFunctions/database");

// retrieves all films in a category
module.exports = {
    page: "/film/categoryfilter/fetch",
    method: "GET",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // gets the categories stuff from querystring, input validation
        let category = req.query.category;
        if(!category || /^[A-Za-z]{1,16}+$/.test(category) === false){
            res.status(400).send([]); // sends empty set in error
            return;
        } else {
            category = category.toUpperCase()
        }

        // gets directory
        const films = await readDb("main","index");
        let inCategory = [];
        for(var i = 0; i < films.length; i++){
            let q = films[i];
            if(q.genre.toUpperCase() == category){
                inCategory.push(q);
            }
        }

        // sets status code accordingly
        if(inCategory.length == 0){
            res.status(404);
        } else {
            res.status(200);
        }

        res.send(inCategory);
        return;
    }
};
