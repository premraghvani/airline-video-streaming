let currentMovie = 0;

// function to select movie, close menu and open the movie
function selectMovie(id){
    // attempts to retrieve metadata
    fetch(`/film/fetchmetadata?id=${id}`)
        .then((response) => {
            if(response.status != 200){
                return false
            } else {
                return response.json()
            }  
        }).then((json)=>{
            if(json==false){
                return
            } else {
                // show movie block
                document.getElementById("libraries").style.display = "none";
                document.getElementById("content").style.display = "block";
                document.getElementById("categoryLibrary").style.display = "none";
                // add its metadata on the screen
                document.getElementById("filmTitle").innerHTML = json.title;
                document.getElementById("filmDescription").innerHTML = json.description;
                document.getElementById("filmYearGenre").innerHTML = `${json.year} | ${json.genre}`;
                document.getElementById("filmCast").innerHTML = `Directed by ${json.director}<br>Cast: ${json.cast}`;
                document.getElementById("backFilm").setAttribute( "onClick", `openCategory("${json.genre}")`);

                // adds video
                var source = document.createElement('source');
                source.src = `film/fetchvideo?id=${id}`;
                source.type = "video/mp4"
                document.getElementById("filmVideo").appendChild(source);
            }
        })
    currentMovie = id;
}

// function to go back to menu, saving any timestamps
function goBack(){
    document.getElementById("libraries").style.display = "block";
    document.getElementById("content").style.display = "none";
    document.getElementById("categoryLibrary").style.display = "none";
    disconnectFilm()
}

// function to check the connection and update page accordingly
function checkConnection() { 
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 500;
        xhr.onload = () => resolve(true);
        xhr.onerror = () => resolve(false);
        xhr.ontimeout = () => resolve(false);
        xhr.open("GET", "/isonline", true);
        xhr.send();
    }).then((connected) => {
        let current = document.getElementById("status");
        if (connected && current.innerHTML !== "ON") {
            current.innerHTML = "ON";
            current.style = "background-color: #5e7d34;";
        } else if (!connected && current.innerHTML !== "OFF") {
            current.innerHTML = "OFF";
            current.style = "background-color: #80003c;";
        }
    });
}

// check connection with the server every 2 seconds
checkConnection()
setInterval(checkConnection, 2000);

// open a category's library
function openCategory(cat){
    disconnectFilm()    
    // attempts to get category films
    fetch(`/film/fetchcategoryfilms?category=${cat}`)
        .then((response) => {
            if(response.status != 200){
                return false
            } else {
                return response.json()
            }  
        }).then((json)=>{
            if(json.length == 0){
                return
            } else {
                // show the category block
                document.getElementById("libraries").style.display = "none";
                document.getElementById("categoryLibrary").style.display = "block";
                document.getElementById("content").style.display = "none";

                // generates the body
                let body = `<br><button class="back" onclick="goBack()">Back</button><br><h2>${cat.toUpperCase()} MOVIES</h2><p>Have an explore of our ${cat.toLowerCase()} movie collection! Please don't hesitate to ask your cabin crew today for anything small, such as popcorn, to make your experience more comfortable! (We aren't Ryanair, we will give you good popcorn)</p><div style="display:flex;">`;
                for(var i = 0; i < json.length; i++){
                    let film = json[i];
                    body += `<div class="film" onclick="selectMovie(${film.id})">
                        <img src="/film/fetchthumbnail?id=${film.id}">
                        <p>${film.title}</p>
                    </div>`
                }
                body += "</div>"

                // embeds the video
                document.getElementById("categoryLibrary").innerHTML = body;
            }
        })
}

// disconnects a film
function disconnectFilm(){
    document.getElementById("filmVideo").innerHTML = "";
    document.getElementById("filmVideo").load();
    currentMovie = 0;
    if(document.getElementById("filmReviews").style.display != "none"){
        toggleFilmReviews()
    }
}

// toggles film reviews
function toggleFilmReviews(){
    let reviewsBox = document.getElementById("filmReviews");
    let button = document.getElementById("filmReviewsToggle");
    let writeReviewId = document.getElementById("movieIdReview");
    if(reviewsBox.style.display == "none"){
        reviewsBox.style.display = "block";
        button.innerHTML = "Hide Film Reviews";
        writeReviewId.value =  currentMovie;
    } else {
        reviewsBox.style.display = "none";
        button.innerHTML = "Show Film Reviews (Spoiler Alert!)"
        writeReviewId.value = "";
    }
}