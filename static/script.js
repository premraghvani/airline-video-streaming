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
                // add its metadata on the screen
                document.getElementById("filmTitle").innerHTML = json.title;
                document.getElementById("filmDescription").innerHTML = json.description;
                document.getElementById("filmYearGenre").innerHTML = `${json.year} | ${json.genre}`;
                document.getElementById("filmCast").innerHTML = `Directed by ${json.director}<br>Cast: ${json.cast}`;

                // adds video
                var source = document.createElement('source');
                source.src = `film/fetchvideo?id=${id}`;
                source.type = "video/mp4"
                document.getElementById("filmVideo").appendChild(source);
            }
        })
}

// function to go back to menu, saving any timestamps
function goBack(){
    document.getElementById("libraries").style.display = "block";
    document.getElementById("content").style.display = "none";
    document.getElementById("filmVideo").innerHTML = "";
    document.getElementById("filmVideo").load()
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
        if (connected && current.innerHTML !== ":)") {
            current.innerHTML = ":)";
            current.style = "background-color: #5e7d34;";
        } else if (!connected && current.innerHTML !== ":(") {
            current.innerHTML = ":(";
            current.style = "background-color: #80003c;";
        }
    });
}

// check connection with the server every 2 seconds
checkConnection()
setInterval(checkConnection, 2000);
