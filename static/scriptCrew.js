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

// crew panel - prewritten messages
function prewritten(num){
  let message = findPrewrittenMsg(num);
  document.getElementById("messageToSend").innerHTML = message;
  document.getElementById("messageToSend").value = message;
}
function findPrewrittenMsg(num){
  switch(num){
    case 1:
      return "Welcome onboard this airline's service to Manchester Airport, we will be calling at: Bramley, New Pudsey, Bradford Interchange, Low Moor, Halifax, Sowerby Bridge, Mytholmroyd, Hebden Bridge, Todmorden, Littleborough, Rochdale, Mills Hill, Manchester Victoria, Manchester Oxford Road, Manchester Piccadilly, Gatley, and Manchester Airport! We hope you enjoy this flight - please feel free to explore our wonderful entertainment collection!";
    case 2:
      return "We have arrived at our destination - we hope you enjoyed your flight with us. Please mind the gap between the plane and the aerobridge edge."
    case 3:
      return "Goodbye!!!!!";
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
    
    fetch("/message/send", {
        method: "POST",
        body: JSON.stringify({message}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        document.getElementById("messageToSend").value = "";
        if(response.status == 200){
            modalAlert("Successfully submitted message!")
        } else {
            modalAlert("Error in submitting message: ",response)
        }
      });
}