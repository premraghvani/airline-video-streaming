// function to select movie, close menu and open the movie
function selectMovie(id){
    document.getElementById("libraries").style.display = "none";
    document.getElementById("content").style.display = "block";
}

// function to go back to menu, saving any timestamps
function goBack(){
    document.getElementById("libraries").style.display = "block";
    document.getElementById("content").style.display = "none";
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
