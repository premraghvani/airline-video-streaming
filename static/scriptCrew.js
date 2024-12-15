// password submit button, authenticates password with server
document.getElementById("passwordsend").addEventListener("click", passwordToToken, false);

function passwordToToken(event){
    event.preventDefault();
    let password = document.getElementById("password").value
    fetch("/authenticate", {
        method: "POST",
        body: JSON.stringify({password}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => response.json())
      .then((json) => {
        if(json.approval == true){
            document.getElementById("password").value = "";
            let expiry = new Date(json.expiry*1000)
            document.cookie = `token=${json.token}; expires=${expiry};`
            showItems();
        } else {
            document.getElementById("password").value = "";
            alert("Incorrect Password")
        }
      });
      
}

// authenticates token, and changes what is shown
function showItems(){
    let cookies = document.cookie;
    fetch("/authenticate/token", {
        method: "POST",
        body: JSON.stringify({cookies}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => response.json())
      .then((json) => {
        if(json.approval == true){
          document.getElementById("auth").style.display = "none";
          document.getElementById("crewPanel").style.display = "block";
          if(json.level == "admin"){
            document.getElementById("adminPanel").style.display = "block";
          }
        } else {
            return;
        }
      });
}

showItems()