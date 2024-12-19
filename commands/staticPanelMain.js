const fs = require("fs");

// simply serves the front html page, replacing elements with the film titles, and the flight details
module.exports = {
    page: "/",
    method: "GET",
    execute: async(req, res) => {
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

        res.set("Content-Type", "text/html");
        res.send(body);
        return;
    }
};
