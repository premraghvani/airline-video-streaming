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

        // adds "skip to category"
        let filmsHtml = "";
        filmsHtml += "<div id=\"skipto\"><h2>Skip straight to a category</h2><ul>"
        for(i in categories){
            let category = categories[i]
            filmsHtml += `<li><a href="#filmcat-${category}">${category.toUpperCase()}</a></li>`
        }
        filmsHtml += "</ul></div>"

        // arranges into the HTML
        for(var i = 0; i < categories.length; i++){
            let cat = categories[i];
            let categoryFilms = "";
            for(var ii = 0; ii < filmsInCategories[cat].length; ii++){
                let thisFilm = filmsInCategories[cat][ii];
                categoryFilms += `<div class="film" onclick="selectMovie(${thisFilm.id})">
                    <img src="/film/fetchthumbnail?id=${thisFilm.id}">
                    <p>${thisFilm.title}</p>
                </div>`
            }

            filmsHtml += `<h2>${cat.toUpperCase()}</h2><div id="filmcat-${cat}" class="filmcategories">${categoryFilms}</div>`
        }

        // puts this into the html before sending
        body = body.replaceAll(`{{libraries}}`,filmsHtml)

        res.set("Content-Type", "text/html");
        res.send(body);
    }
};
