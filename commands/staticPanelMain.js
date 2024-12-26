const fs = require("fs");
const config = require("../config.json")

// simply serves the front html page, replacing elements with the film titles, and the flight details
module.exports = {
    page: "/",
    method: "GET",
    execute: async(req, res) => {
        let body = fs.readFileSync("./static/main.html").toString();

        // gets all films available, and categories
        let films = require("../assets/index.json");
        let filmsInCategories = {};
        for(var i = 0; i < films.length; i++){
            let cat = films[i].genre.toLowerCase();
            if(!filmsInCategories[cat]){
                filmsInCategories[cat] = [];
            }
            filmsInCategories[cat].push(films[i]);
        }
        let categories = Object.keys(filmsInCategories).sort();

        // adds category buttons
        let filmsHtml = ""
        for(i in categories){
            let category = categories[i].toLowerCase().split("")
            category[0] = category[0].toUpperCase()
            category = category.join("")
            filmsHtml += `<button onclick="openCategory('${category}')">${category}</button> `
        }
        filmsHtml += ""

        // puts this into the html before sending
        body = body.replaceAll(`{{genres}}`,filmsHtml)

        res.set("Content-Type", "text/html").send(body);
        return;
    }
};
