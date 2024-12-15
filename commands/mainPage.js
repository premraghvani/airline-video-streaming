const fs = require("fs");

// simply serves the front html page, replacing elements with the film titles, and the flight details
module.exports = {
    page: "/",
    method: "GET",
    execute: (req, res) => {
        let body = fs.readFileSync("./static/main.html").toString();

        // gets flight details, and puts into body
        let flightDetails = require("../assets/flightData.json")
        for(key in flightDetails){
            body = body.replaceAll(`{{${key}}}`,flightDetails[key])
        }

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
        let filmsHtml = "";
        filmsHtml += "<div><h2>What do you fancy watching?</h2>"
        for(i in categories){
            let category = categories[i]
            filmsHtml += `<button class="category" onclick="openCategory('${category}')">${category.toUpperCase()}</button> `
        }
        filmsHtml += "</div>"

        // puts this into the html before sending
        body = body.replaceAll(`{{libraries}}`,filmsHtml)

        res.set("Content-Type", "text/html");
        res.send(body);
    }
};
