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

// toggles a panel to full view
function togglePanel(panelName){
  let button = document.getElementById(`${panelName}PanelToggle`);
  let section = document.getElementById(`${panelName}PanelInner`);
  if(button.innerHTML.includes("show")){
    section.style.display = "block";
    button.innerHTML = button.innerHTML.replace("show","hide")
  } else {
    section.style.display = "none";
    button.innerHTML = button.innerHTML.replace("hide","show")
  }
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
            document.getElementById("existingFilmsPanel").style.display = "block";
            document.getElementById("newFilmPanel").style.display = "block";
            document.getElementById("uploadContentPanel").style.display = "block";
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

// onload: gets the film categories into the film managers panel
loadFilmCats()
function loadFilmCats(){
  fetch("/film/category/fetch", {
    method: "GET"
  }).then((response) => {
    return response.json();
  }).then((json)=>{
    let selectionOptions = "";
    if(!!json.categories){
      selectionOptions = `<option value="null">Select a Genre</option>`
      for(var i = 0; i < json.categories.length; i++){
        selectionOptions += `<option value="${json.categories[i]}">${json.categories[i].toUpperCase()}</option>`
      }
    }
    document.getElementById("filmCat").innerHTML = selectionOptions;
  });
}

// updates when a genre is picked
function selectedGenre(){
  let value = document.getElementById("filmCat").value;
  document.getElementById("filmSelBox").style.display = "none"; 
  if(value == "null"){
    document.getElementById("filmNameBox").style.display = "none";
    return;
  }
  document.getElementById("filmNameBox").style.display = "block";

  fetch(`/film/categoryfilter/fetch?category=${value}`, {
    method: "GET"
  }).then((response) => {
    return response.json();
  }).then((json)=>{
    let selectionOptions = "";
    if(json.length != undefined){
      selectionOptions = `<option value="null">Select a Film</option>`
      for(var i = 0; i < json.length; i++){
        selectionOptions += `<option value="${json[i].id}">(#${json[i].id}) ${json[i].title}</option>`
      }
    }
    document.getElementById("filmCollection").innerHTML = selectionOptions;
  });
}

// updates when a film is selected
function selectedFilm(){
  let value = document.getElementById("filmCollection").value;
  if(value == "null"){
    document.getElementById("filmSelBox").style.display = "none";
    return;
  }
  document.getElementById("filmSelBox").style.display = "block";

  fetch(`/film/individual/metadata?id=${value}`, {
    method: "GET"
  }).then((response) => {
    return response.json();
  }).then((json)=>{
    document.getElementById("filmSelImg").src = `/film/individual/thumbnail?id=${value}`;
    document.getElementById("filmSelDetails").innerHTML = `<b>${json.title}</b><br>${json.description}<br>Cast: ${json.cast}<br>${json.director} | ${json.genre} | ${json.year}`;
    document.getElementById("filmDeleteId").value = value;
    document.getElementById("editFilmId").value = value;
  });
}

// delete a film
document.getElementById("filmDeleteButton").addEventListener("click", deleteFilm, false);
function deleteFilm(event){
    event.preventDefault();
    let title = document.getElementById("filmDeleteConfirm").value;
    let id = document.getElementById("filmDeleteId").value;
    if(/^[A-Za-z0-9 \.,\-!?'"()]+$/.test(title) == false || !title){
        modalAlert("This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
        return;
    }

    fetch("/film/individual/delete", {
        method: "POST",
        body: JSON.stringify({title,id}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        document.getElementById("filmDeleteConfirm").value = "";
        if(response.status == 200){
            modalAlert("Successfully deleted film! It may still appear in people's panels until the page has been refreshed.");
            document.getElementById("filmDeleteId").value = "";
            return null;
        }
        return response.json()
      }).then((json) => {
        modalAlert(`Error: ${json.message}`)
      });
}

// edit a film
document.getElementById("editFilmSubmit").addEventListener("click", editFilm, false);
function editFilm(event){
    event.preventDefault();
    let title = document.getElementById("editFilmTitle").value;
    let description = document.getElementById("editFilmDescription").value;
    let genre = document.getElementById("editFilmGenre").value;
    let cast = document.getElementById("editFilmCast").value;
    let director = document.getElementById("editFilmDirector").value;
    let year = document.getElementById("editFilmYear").value;
    let id = document.getElementById("editFilmId").value;
    let newVideo = document.getElementById("editFilmVideo").checked;
    let newThumbnail = document.getElementById("editFilmThumbnail").checked;

    const mainRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/

    // input vaildation
    if(!!title && mainRegex.test(title) == false){
        modalAlert("This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
        return;
    }
    if(!!description && mainRegex.test(description) == false){
      modalAlert("This description can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!!cast && mainRegex.test(cast) == false){
      modalAlert("This cast list can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!!director && mainRegex.test(director) == false){
      modalAlert("This director name can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!!genre && /^[A-Za-z]+$/.test(genre) == false){
      modalAlert("This genre can not be accepted, as we only allow letters (A-Z, a-z) only");
      return;
    }
    if(!!year && /^[0-9]+$/.test(year) == false){
      modalAlert("This year can not be accepted, as we only allow integers (0-9) only");
      return;
    }

    if(!!year){
      year = parseInt(year);
    }

    fetch("/film/individual/edit", {
        method: "POST",
        body: JSON.stringify({id,title,description,genre,cast,year,newVideo,newThumbnail,director}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        if(response.status == 200){
            modalAlert(`Successfully edited film!
              <br><br>If you have specified you want to upload a new thumbnail and/or video, please scroll down to the bottom of this page to upload.
              <br>You will need the film's ID number, which is <b>${id}</b>
              <br>You specified - New video: ${newVideo}, New thumbnail: ${newThumbnail}`);
            document.getElementById("editFilmTitle").value = "";
            document.getElementById("editFilmDescription").value = "";
            document.getElementById("editFilmCast").value = "";
            document.getElementById("editFilmDirector").value = "";
            document.getElementById("editFilmYear").value = "";
            document.getElementById("editFilmGenre").value = "";
            document.getElementById("editFilmId").value = "";
            document.getElementById("editFilmVideo").checked = false;
            document.getElementById("editFilmThumbnail").checked = false;
            return null;
        }
        return response.json()
      }).then((json) => {
        modalAlert(`Error: ${json.message}`)
      });
}

// makes a new film (metadata)
document.getElementById("newFilmSubmit").addEventListener("click", newFilm, false);
function newFilm(event){
    event.preventDefault();
    let title = document.getElementById("newFilmTitle").value;
    let description = document.getElementById("newFilmDescription").value;
    let genre = document.getElementById("newFilmGenre").value;
    let cast = document.getElementById("newFilmCast").value;
    let director = document.getElementById("newFilmDirector").value;
    let year = document.getElementById("newFilmYear").value;

    const mainRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/

    // input vaildation
    if(!title || mainRegex.test(title) == false){
        modalAlert("This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
        return;
    }
    if(!description || mainRegex.test(description) == false){
      modalAlert("This description can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!cast || mainRegex.test(cast) == false){
      modalAlert("This cast list can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!director || mainRegex.test(director) == false){
      modalAlert("This director name can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"()");
      return;
    }
    if(!genre || /^[A-Za-z]+$/.test(genre) == false){
      modalAlert("This genre can not be accepted, as we only allow letters (A-Z, a-z) only");
      return;
    }
    if(!year || /^[0-9]+$/.test(year) == false){
      modalAlert("This year can not be accepted, as we only allow integers (0-9) only");
      return;
    } else {
      year = parseInt(year)
    }

    let success = false;
    fetch("/film/individual/new/metadata", {
        method: "POST",
        body: JSON.stringify({title,description,genre,cast,year,director}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((response) => {
        if(response.status == 200){
            success = true;
            document.getElementById("newFilmTitle").value = "";
            document.getElementById("newFilmDescription").value = "";
            document.getElementById("newFilmCast").value = "";
            document.getElementById("newFilmDirector").value = "";
            document.getElementById("newFilmYear").value = "";
            document.getElementById("newFilmGenre").value = "";
        }
        return response.json()
      }).then((json) => {
        if(success){
          modalAlert(`Successfully created new film!
            <br><br>Now, please scroll down to the bottom of this page to upload the thumbnail and video.
            <br>You will need the film's ID number, which is <b>${json.id}</b>`);
        } else {
           modalAlert(`Error: ${json.message}`);
        }
      });
}

// script to upload a file
document.getElementById("fileSubmit").addEventListener("click", async(event) => {event.preventDefault; await fileSubmit(event)}, false);
async function fileSubmit(event){
  event.preventDefault();
  const maxFileChunk = 2*10**6;
  let file = document.getElementById("fileInput").files[0];
  let id = document.getElementById("fileId").value;

  // input validation
  if(!file){
    modalAlert("Must include a file");
    return;
  }
  if(["video/mp4","image/jpeg"].includes(file.type) == false){
    modalAlert("File must be MP4 or JPEG");
    return;
  }
  if(!id || /^[0-9]+$/.test(id) == false){
    modalAlert("Invalid file ID");
    return;
  }

  // uploading
  let size = file.size;
  let start = 0;

  while(start < size){
    let end = Math.min(start+maxFileChunk, size);
    let chunkToSend = file.slice(start,end);

    const headers = {
      "Content-Type":file.type,
      "X-Request-ID":id,
      "Content-Range":`bytes ${start}-${end-1}/${size}`
    }

    const body = await chunkToSend.arrayBuffer();

    try {
      const resp = await fetch("/film/individual/new/multimedia",{
        method:"PUT",
        headers,
        body
      });


      let text = await resp.text()
      let textJson = JSON.parse(text)

      if(resp.status != 200){
        modalAlert(`Error: ${textJson.message}`);
        return;
      }
    } catch(err) {
      console.log(err)
      modalAlert("Err: could not upload file");
      return;
    }

    start = end;
  }

  // finished
  modalAlert("Successfully uploaded file")

  // clears items
  document.getElementById("fileInput").value = "";
  document.getElementById("fileId").value = "";
}