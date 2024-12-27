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
            modalAlert("Incorrect Password")
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
          document.getElementById("paxMessagePanel").style.display = "block";
          document.getElementById("flightDetailsPanel").style.display = "block";
          if(json.level == "admin"){
            document.getElementById("approveReviewsPanel").style.display = "block";
            document.getElementById("uploadFilmPanel").style.display = "block";
            document.getElementById("editFilmPanel").style.display = "block";
            document.getElementById("passwordServicePanel").style.display = "block";
          }
        } else {
            return;
        }
      });
}

showItems()

// crew panel - prewritten messages
function prewritten(num){
  let message = findPrewrittenMsg(num);
  document.getElementById("messageToSend").innerHTML = message;
  document.getElementById("messageToSend").value = message;
}
function findPrewrittenMsg(num){
  switch(num){
    case 1:
      return "Welcome onboard this airline's service to Manchester Airport, our flight however is actually a train, so we will be calling at- Bramley, New Pudsey, Bradford Interchange, Low Moor, Halifax, Sowerby Bridge, Mytholmroyd, Hebden Bridge, Todmorden, Littleborough, Rochdale, Mills Hill, Manchester Victoria, Manchester Oxford Road, Manchester Piccadilly, Gatley, and Manchester Airport. We hope you enjoy this flight - please feel free to explore our wonderful entertainment collection here only at Streambox!";
    case 2:
      return "We have arrived at Manchester Airport - we hope you enjoyed your train-plane with us. Please mind the gap between the plane and the aerobridge edge."
    case 3:
      return "Please rate us 5 stars on UberPlanes! I mean bye.";
    case 4:
      return "Our meal service is now available, and our cabin crew will be distributing food, as long as you pay (we're bringing out our inner Ryanair haha)"
    default:
      return ""
  }
}

// crew panel - send message
document.getElementById("messagesend").addEventListener("click", submitMessage, false);
function submitMessage(event){
    event.preventDefault();
    let message = document.getElementById("messageToSend").value;
    if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(message) == false || !message){
        modalAlert("This message can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
        return;
    }

    fetch("/message/send", {
        method: "POST",
        body: JSON.stringify({message}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        document.getElementById("messageToSend").value = "";
        if(response.status == 200){
            modalAlert("Successfully submitted message!");
            document.getElementById("messageToSend").value = "";
            return null;
        }
        return response.json()
      }).then((json) => {
        modalAlert(`Error: ${json.message}`)
      });
}

// submits the form for flight info change
document.getElementById("flightInfoSubmit").addEventListener("click", flightInfoSubmit, false);
function flightInfoSubmit(event){
    // sets up basics
    event.preventDefault();
    let flightNum = document.getElementById("flightNum").value;
    let originCode = document.getElementById("originCode").value;
    let origin = document.getElementById("origin").value;
    let destinationCode = document.getElementById("destinationCode").value;
    let destination = document.getElementById("destination").value;

    // input validation
    const regexMain = /^[A-Za-z0-9 ]+$/
    const regexCodes = /^[A-Z]{3}/
    
    if(!!flightNum && regexMain.test(flightNum) == false){
      modalAlert("Flight number not accepted - must only include: A-Z, a-z, 0-9 or spaces");
      return;
    }
    if(!!origin && regexMain.test(origin) == false){
      modalAlert("Origin city name not accepted - must only include: A-Z, a-z, 0-9 or spaces");
      return;
    }
    if(!!destination && regexMain.test(destination) == false){
      modalAlert("Destination city name not accepted - must only include: A-Z, a-z, 0-9 or spaces");
      return;
    }
    if(!!originCode && regexCodes.test(originCode) == false){
      modalAlert("Origin city code not accepted - must only include: A-Z (exactly 3 letters)");
      return;
    }
    if(!!destinationCode && regexCodes.test(destinationCode) == false){
      modalAlert("Destination city code not accepted - must only include: A-Z (exactly 3 letters)");
      return;
    }

    // sends the request
    fetch("/flight/data", {
        method: "POST",
        body: JSON.stringify({flightNum,origin,destination,originCode,destinationCode})
      }).then((response) => {
        if(response.status == 200){
            modalAlert("Successfully submitted flight information!");
            document.getElementById("flightNum").value = "";
            document.getElementById("originCode").value = "";
            document.getElementById("origin").value = "";
            document.getElementById("destinationCode").value = "";
            document.getElementById("destination").value = "";
            return null;
        }
        return response.json();
      }).then((json)=>{
        modalAlert(`Error: ${json.message}`);
        return;
      });
}

// submits the form for password change
document.getElementById("passwordsSubmit").addEventListener("click", passwordsSubmit, false);
function passwordsSubmit(event){
    // sets up basics
    event.preventDefault();
    let password = document.getElementById("passwords-new").value;
    let mode = document.getElementById("passwords-category").value;

    // input validation    
    if(!password || /^[A-Za-z0-9 \.,\-!?'"()]+$/.test(password) == false){
      modalAlert("New password not accepted - must only include: A-Z a-z 0-9 spaces .,-!?'\"()");
      return;
    }

    // sends the request
    fetch("/authenticate/change", {
        method: "POST",
        body: JSON.stringify({mode,password})
      }).then((response) => {
        if(response.status == 200){
            modalAlert(`Successfully changed password for ${mode}`);
            document.getElementById("passwords-new").value = "";
            return null;
        }
        return response.json();
      }).then((json)=>{
        modalAlert(`Error: ${json.message}`);
        return;
      });
}