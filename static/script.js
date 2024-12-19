let currentMovie = 0;
let lastRead = 0;

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

// function to check the connection and update page accordingly, and messages
function checkConnection() {
    let current = document.getElementById("availabilityStatus");
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 500);

    fetch(`/isonline`,{signal:controller.signal})
        .then((response) => {
            clearTimeout(timeout);
            if (response.status !== 200) {
                if (current.innerHTML !== "Unavailable") {
                    current.innerHTML = "Unavailable";
                    current.style = "color: #800;";
                }
            } else {
                if (current.innerHTML !== "Available") {
                    current.innerHTML = "Available";
                    current.style = "color: #080;";
                }
            }
            return response.json();
        })
        .then((json) => {
            if (json.messages.length === 0) {
                return;
            } else {
                // Displays messages
                let messageToShow = [];
                for (var i = 0; i < json.messages.length; i++) {
                    if (lastRead < json.messages[i].timestamp) {
                        messageToShow.push(json.messages[i].message);
                        lastRead = json.messages[i].timestamp;
                    }
                }

                // Actually shows if any
                if (messageToShow.length > 0) {
                    modalAlert(`<b>Message from Crew:</b><br><br>${messageToShow.join("<br>")}`);
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching connection status:", error);
            if (current.innerHTML !== "Unavailable") {
                current.innerHTML = "Unavailable";
                current.style = "color: #800;";
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
                let top = `<h2>${cat.toUpperCase()} MOVIES</h2><p>Have an explore of our ${cat.toLowerCase()} movie collection! Please don't hesitate to ask your cabin crew today for anything small, such as popcorn, to make your experience more comfortable! (We aren't Ryanair, we will give you good popcorn)</p>`;
                let body = "";
                for(var i = 0; i < json.length; i++){
                    let film = json[i];
                    body += `<div class="film" onclick="selectMovie(${film.id})">
                        <img src="/film/fetchthumbnail?id=${film.id}" alt="Thumbnail for ${film.title}">
                        <p>${film.title}</p>
                    </div> `
                }

                // embeds the video
                document.getElementById("movieContainer").innerHTML = body;
                document.getElementById("movieTop").innerHTML = top;
            }
        })
}

// disconnects a film
function disconnectFilm(){
    document.getElementById("filmVideo").innerHTML = "";
    document.getElementById("filmVideo").load();
    document.getElementById("review").value = "";
    document.getElementById("movieIdReview").value = "";
    currentMovie = 0;
    if(document.getElementById("filmReviews").style.display != "none"){
        toggleFilmReviews()
    }
}

// toggles film reviews
function toggleFilmReviews(){
    const reviewsBox = document.getElementById("filmReviews");
    const button = document.getElementById("filmReviewsToggle");
    const writeReviewId = document.getElementById("movieIdReview");
    const filmReviewContent = document.getElementById("filmReviewContent");

    // if there is no review box open
    if(reviewsBox.style.display == "none"){
        reviewsBox.style.display = "block";
        button.innerHTML = "Hide Film Reviews";
        writeReviewId.value =  currentMovie;

        // fetches the reviews
        fetch(`/review/fetch?id=${currentMovie}`)
        .then((response) => {
            if(response.status != 200){
                filmReviewContent.innerHTML = "<i>No Reviews</i>"
                return false;
            } else {
                return response.json()
            }  
        }).then((json)=>{
            if(json.length == 0){
                filmReviewContent.innerHTML = "<i>No Reviews</i>"
                return
            } else {
                // generates the content
                let reviewContent = "";
                for(var i = 0; i < json.length; i++){
                    let review = json[i];
                    reviewContent += `<div class="review">
                        <blockquote class="reviewItem">${review.review}</blockquote>
                        <p class="reviewCaption">Reviewed on flight ${review.flight} about ${relativeTime(review.timestamp)} ago</p>
                    </div>`
                }
                // embeds the review
                filmReviewContent.innerHTML = reviewContent;
            }
        })

    // if there is a review box
    } else {
        reviewsBox.style.display = "none";
        button.innerHTML = "Show Film Reviews (Spoiler Alert!)"
        writeReviewId.value = "";
    }
}

// relative timestamp, e.g. finds how far ago something was
function relativeTime(timeThen){
    const d = new Date();
    let timeNow = Math.floor(d.getTime() / 1000);
    let timeDiff = timeNow - timeThen;
    if(timeDiff == 1){

    } else if(timeDiff < 120 && timeDiff > 1){
        return "1 second"
    } else if(timeDiff < 120*60){
        return `${Math.round(timeDiff / 60)} minutes`
    } else if(timeDiff < 48*60*60){
        return `${Math.round(timeDiff / 60 / 60)} hours`
    } else {
        return `${Math.round(timeDiff / 60 / 60 / 24)} days`
    }
}

// submit reviews form
document.getElementById("reviewsend").addEventListener("click", submitReviews, false);
function submitReviews(event){
    event.preventDefault();
    let review = document.getElementById("review").value;
    let movieId = document.getElementById("movieIdReview").value;
    
    fetch("/review/submit", {
        method: "POST",
        body: JSON.stringify({review,movieId}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        document.getElementById("review").value = "";
        document.getElementById("movieIdReview").value = "";
        if(response.status == 202){
            modalAlert("Successfully submitted review!");
            return;
        }
        return response.json();
      }).then((json)=>{
        console.log(json)
      });
}

// modal alert
function modalAlert(msg){
    let modal = document.getElementById("modal");
    let closeButton = document.getElementById("closeBtn");
    document.getElementById("modalText").innerHTML = msg;
    modal.style.display = "block";
    closeButton.onclick = function(){modal.style.display = "none"}
    window.onclick = function(event){if(event.target == modal){modal.style.display="none";}}
}