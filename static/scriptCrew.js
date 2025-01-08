// password submit button, authenticates password with server
document
  .getElementById("passwordsend")
  .addEventListener("click", passwordToToken, false);
function passwordToToken(event) {
  event.preventDefault();
  let password = document.getElementById("password").value;
  apiCall(`/authenticate`, "POST", { password }, undefined, function (resp) {
    document.getElementById("password").value = "";
    if (resp.body.approval === true) {
      let expiry = new Date(resp.body.expiry * 1000);
      document.cookie = `token=${resp.body.token}; expires=${expiry};`;
      showItems();
    } else {
      modalAlert(`Error: ${resp.body.message}`);
    }
  });
}

// toggles a panel to full view
function togglePanel(panelName) {
  let button = document.getElementById(`${panelName}PanelToggle`);
  let section = document.getElementById(`${panelName}PanelInner`);
  if (button.innerHTML.includes("show")) {
    section.style.display = "block";
    button.innerHTML = button.innerHTML.replace("show", "hide");
  } else {
    section.style.display = "none";
    button.innerHTML = button.innerHTML.replace("hide", "show");
  }
}

// authenticates token, and changes what is shown
function showItems() {
  let cookies = document.cookie;

  apiCall(
    `/authenticate/token`,
    "POST",
    { cookies },
    undefined,
    function (resp) {
      let json = resp.body;
      if (json.approval == true) {
        document.getElementById("auth").style.display = "none";
        document.getElementById("paxMessagePanel").style.display = "block";
        document.getElementById("flightDetailsPanel").style.display = "block";
        if (json.level == "admin") {
          document.getElementById("existingFilmsPanel").style.display = "block";
          document.getElementById("newFilmPanel").style.display = "block";
          document.getElementById("uploadContentPanel").style.display = "block";
          document.getElementById("passwordServicePanel").style.display =
            "block";
        }
      } else {
        return;
      }
    }
  );
}

showItems();

// crew panel - prewritten messages
function prewritten(num) {
  let message = findPrewrittenMsg(num);
  document.getElementById("messageToSend").innerHTML = message;
  document.getElementById("messageToSend").value = message;
}
function findPrewrittenMsg(num) {
  switch (num) {
    case 1:
      return "Welcome onboard this service! Please explore our wonderful entertainment collection here only at Streambox! We hope you enjoy your journey with us today.";
    case 2:
      return "We have now arrived at our destination. Please ensure you have taken all belongings with you before alighting here.";
    case 3:
      return "We hope that you have enjoyed your journey with us, and if you have a connecting journey, we wish you a good journey.";
    case 4:
      return "Our meal service is now available, and our crew members will be in the aisles distributing food.";
    default:
      return "";
  }
}

// crew panel - send message
document
  .getElementById("messagesend")
  .addEventListener("click", submitMessage, false);
function submitMessage(event) {
  event.preventDefault();
  let message = document.getElementById("messageToSend").value;
  if (/^[A-Za-z0-9 \.,\-!?'"()]{1,512}$/.test(message) == false || !message) {
    modalAlert(
      "This message can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 512 characters long"
    );
    return;
  }

  apiCall(`/message/send`, "POST", { message }, undefined, function (resp) {
    document.getElementById("messageToSend").value = "";
    if (resp.status == 200) {
      modalAlert("Successfully submitted message!");
      document.getElementById("messageToSend").value = "";
    } else {
      modalAlert(`Error: ${resp.body.message}`);
    }
  });
}

// submits the form for flight info change
document
  .getElementById("flightInfoSubmit")
  .addEventListener("click", flightInfoSubmit, false);
function flightInfoSubmit(event) {
  // sets up basics
  event.preventDefault();
  let flightNum = document.getElementById("flightNum").value;
  let originCode = document.getElementById("originCode").value;
  let origin = document.getElementById("origin").value;
  let destinationCode = document.getElementById("destinationCode").value;
  let destination = document.getElementById("destination").value;

  // input validation
  const regexCodes = /^[A-Z]{3}/;

  if (!!flightNum && /^[A-Za-z0-9 ]{1,8}$/.test(flightNum) == false) {
    modalAlert(
      "Flight number not accepted - must only include: A-Z, a-z, 0-9 or spaces - up to 8 characters"
    );
    return;
  }
  if (!!origin && /[A-Za-z0-9 ]{1,16}/.test(origin) == false) {
    modalAlert(
      "Origin city name not accepted - must only include: A-Z, a-z, 0-9 or spaces - up to 16 characters"
    );
    return;
  }
  if (!!destination && /[A-Za-z0-9 ]{1,16}/.test(destination) == false) {
    modalAlert(
      "Destination city name not accepted - must only include: A-Z, a-z, 0-9 or spaces - up to 16 characters"
    );
    return;
  }
  if (!!originCode && regexCodes.test(originCode) == false) {
    modalAlert(
      "Origin city code not accepted - must only include: A-Z (exactly 3 letters)"
    );
    return;
  }
  if (!!destinationCode && regexCodes.test(destinationCode) == false) {
    modalAlert(
      "Destination city code not accepted - must only include: A-Z (exactly 3 letters)"
    );
    return;
  }

  // sends the request
  apiCall(
    `/flight/data`,
    "POST",
    { flightNum, origin, destination, originCode, destinationCode },
    undefined,
    function (resp) {
      if (resp.status == 200) {
        modalAlert("Successfully submitted flight information!");
        document.getElementById("flightNum").value = "";
        document.getElementById("originCode").value = "";
        document.getElementById("origin").value = "";
        document.getElementById("destinationCode").value = "";
        document.getElementById("destination").value = "";
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}

// submits the form for password change
document
  .getElementById("passwordsSubmit")
  .addEventListener("click", passwordsSubmit, false);
function passwordsSubmit(event) {
  // sets up basics
  event.preventDefault();
  let password = document.getElementById("passwords-new").value;
  let mode = document.getElementById("passwords-category").value;

  // input validation
  if (!password || /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/.test(password) == false) {
    modalAlert(
      "New password not accepted - must only include: A-Z a-z 0-9 spaces .,-!?'\"() - up to 64 characters"
    );
    return;
  }

  // sends the request
  apiCall(
    `/authenticate/change`,
    "POST",
    { mode, password },
    undefined,
    function (resp) {
      if (resp.status == 200) {
        modalAlert(`Successfully changed password for ${mode}`);
        document.getElementById("passwords-new").value = "";
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}

// onload: gets the film categories into the film managers panel
loadFilmCats();
function loadFilmCats() {
  apiCall(`/film/category/fetch`, "GET", undefined, undefined, function (resp) {
    let json = resp.body;
    let selectionOptions = "";
    if (json.categories) {
      selectionOptions = `<option value="null">Select a Genre</option>`;
      for (var i = 0; i < json.categories.length; i++) {
        selectionOptions += `<option value="${
          json.categories[i]
        }">${json.categories[i].toUpperCase()}</option>`;
      }
    }
    document.getElementById("filmCat").innerHTML = selectionOptions;

    if (resp.status != 200) {
      modalAlert(
        `We had an error loading part of this page, due to: ${resp.body.message}`
      );
    }
  });
}

// updates when a genre is picked
function selectedGenre() {
  let value = document.getElementById("filmCat").value;
  document.getElementById("filmSelBox").style.display = "none";
  if (value == "null") {
    document.getElementById("filmNameBox").style.display = "none";
    return;
  }
  document.getElementById("filmNameBox").style.display = "block";

  apiCall(
    `/film/categoryfilter/fetch?category=${value}`,
    "GET",
    undefined,
    undefined,
    function (resp) {
      let json = resp.body;
      let selectionOptions = "";
      if (json.length != undefined) {
        selectionOptions = `<option value="null">Select a Film</option>`;
        for (var i = 0; i < json.length; i++) {
          selectionOptions += `<option value="${json[i].id}">(#${json[i].id}) ${json[i].title}</option>`;
        }
      }
      document.getElementById("filmCollection").innerHTML = selectionOptions;
      if (resp.status != 200) {
        modalAlert(
          `We are sorry but we could not load the names of movies in genre "${value}", due to: ${resp.body.message}`
        );
      }
    }
  );
}

// updates when a film is selected
function selectedFilm() {
  let value = document.getElementById("filmCollection").value;
  if (value == "null") {
    document.getElementById("filmSelBox").style.display = "none";
    return;
  }
  document.getElementById("filmSelBox").style.display = "block";

  apiCall(
    `/film/individual/metadata?id=${value}`,
    "GET",
    undefined,
    undefined,
    function (resp) {
      if (resp.status != 200) {
        modalAlert(
          `We are sorry but we could not load that movie's details, due to: ${resp.body.message}`
        );
        return;
      }
      let json = resp.body;
      document.getElementById(
        "filmSelImg"
      ).src = `/film/individual/thumbnail?id=${value}`;
      document.getElementById(
        "filmSelDetails"
      ).innerHTML = `<b>${json.title}</b><br>${json.description}<br>Cast: ${json.cast}<br>${json.director} | ${json.genre} | ${json.year}`;
      document.getElementById("filmDeleteId").value = value;
      document.getElementById("editFilmId").value = value;
      displayReviewApprovals(value);
    }
  );
}

// delete a film
document
  .getElementById("filmDeleteButton")
  .addEventListener("click", deleteFilm, false);
function deleteFilm(event) {
  event.preventDefault();
  let title = document.getElementById("filmDeleteConfirm").value;
  let id = document.getElementById("filmDeleteId").value;
  if (/^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/.test(title) == false || !title) {
    modalAlert(
      "This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }

  apiCall(
    `/film/individual/delete`,
    "POST",
    { title, id },
    undefined,
    function (resp) {
      document.getElementById("filmDeleteConfirm").value = "";
      if (resp.status == 200) {
        modalAlert(
          "Successfully deleted film! It may still appear in people's panels until the page has been refreshed."
        );
        document.getElementById("filmDeleteId").value = "";
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}

// edit a film
document
  .getElementById("editFilmSubmit")
  .addEventListener("click", editFilm, false);
function editFilm(event) {
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

  const mainRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/;

  // input vaildation
  if (!!title && mainRegex.test(title) == false) {
    modalAlert(
      "This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }
  if (
    !!description &&
    /^[A-Za-z0-9 \.,\-!?'"()]{1,256}$/.test(description) == false
  ) {
    modalAlert(
      "This description can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 512 characters"
    );
    return;
  }
  if (!!cast && mainRegex.test(cast) == false) {
    modalAlert(
      "This cast list can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }
  if (!!director && mainRegex.test(director) == false) {
    modalAlert(
      "This director name can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }
  if (!!genre && /^[A-Za-z]{1,16}$/.test(genre) == false) {
    modalAlert(
      "This genre can not be accepted, as we only allow letters (A-Z, a-z) only - up to 16 characters"
    );
    return;
  }
  if (!!year && /^[0-9]+$/.test(year) == false) {
    modalAlert(
      "This year can not be accepted, as we only allow integers (0-9) only"
    );
    return;
  }

  if (year) {
    year = parseInt(year);
  }

  apiCall(
    `/film/individual/edit`,
    "POST",
    {
      id,
      title,
      description,
      genre,
      cast,
      year,
      newVideo,
      newThumbnail,
      director,
    },
    undefined,
    function (resp) {
      if (resp.status == 200) {
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
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}

// makes a new film (metadata)
document
  .getElementById("newFilmSubmit")
  .addEventListener("click", newFilm, false);
function newFilm(event) {
  event.preventDefault();
  let title = document.getElementById("newFilmTitle").value;
  let description = document.getElementById("newFilmDescription").value;
  let genre = document.getElementById("newFilmGenre").value;
  let cast = document.getElementById("newFilmCast").value;
  let director = document.getElementById("newFilmDirector").value;
  let year = document.getElementById("newFilmYear").value;

  const mainRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/;

  // input vaildation
  if (!title || mainRegex.test(title) == false) {
    modalAlert(
      "This title can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }
  if (
    !description ||
    /^[A-Za-z0-9 \.,\-!?'"()]{1,256}$/.test(description) == false
  ) {
    modalAlert(
      "This description can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 256 characters"
    );
    return;
  }
  if (!cast || mainRegex.test(cast) == false) {
    modalAlert(
      "This cast list can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 characters"
    );
    return;
  }
  if (!director || mainRegex.test(director) == false) {
    modalAlert(
      "This director name can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 64 character"
    );
    return;
  }
  if (!genre || /^[A-Za-z]+$/.test(genre) == false) {
    modalAlert(
      "This genre can not be accepted, as we only allow letters (A-Z, a-z) only"
    );
    return;
  }
  if (!year || /^[0-9]+$/.test(year) == false) {
    modalAlert(
      "This year can not be accepted, as we only allow integers (0-9) only"
    );
    return;
  } else {
    year = parseInt(year);
  }

  apiCall(
    `/film/individual/new/metadata`,
    "POST",
    { title, description, genre, cast, year, director },
    undefined,
    function (resp) {
      if (resp.status == 200) {
        document.getElementById("newFilmTitle").value = "";
        document.getElementById("newFilmDescription").value = "";
        document.getElementById("newFilmCast").value = "";
        document.getElementById("newFilmDirector").value = "";
        document.getElementById("newFilmYear").value = "";
        document.getElementById("newFilmGenre").value = "";
        modalAlert(`Successfully created new film!
              <br><br>Now, please scroll down to the bottom of this page to upload the thumbnail and video.
              <br>You will need the film's ID number, which is <b>${resp.body.id}</b>`);
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}

// script to upload a file
document.getElementById("fileSubmit").addEventListener(
  "click",
  async (event) => {
    event.preventDefault;
    await fileSubmit(event);
  },
  false
);
async function fileSubmit(event) {
  event.preventDefault();
  const maxFileChunk = 2 * 10 ** 6;
  let file = document.getElementById("fileInput").files[0];
  let id = document.getElementById("fileId").value;

  // input validation
  if (!file) {
    modalAlert("Must include a file");
    return;
  }
  if (["video/mp4", "image/jpeg"].includes(file.type) == false) {
    modalAlert("File must be MP4 or JPEG");
    return;
  }
  if (!id || /^[0-9]+$/.test(id) == false) {
    modalAlert("Invalid file ID");
    return;
  }

  modalAlert(
    `Uploading...<div id="progressContainer"><div id="progressBar">0%</div></div>`
  );

  // uploading
  let size = file.size;
  let start = 0;

  while (start < size) {
    let end = Math.min(start + maxFileChunk, size);
    let chunkToSend = file.slice(start, end);

    const headers = {
      "Content-Type": file.type,
      "X-Request-ID": id,
      "Content-Range": `bytes ${start}-${end - 1}/${size}`,
    };

    const body = await chunkToSend.arrayBuffer();

    try {
      const resp = await fetch("/film/individual/new/multimedia", {
        method: "PUT",
        headers,
        body,
      });

      let text = await resp.text();
      let textJson = JSON.parse(text);

      if (resp.status != 200) {
        modalAlert(`Error: ${textJson.message}`);
        return;
      }

      // updates progress bar
      let percentageDone = ((end * 100) / size).toFixed(2);
      document.getElementById("progressBar").innerHTML = `${percentageDone} %`;
      document.getElementById("progressBar").style.width = `${percentageDone}%`;
    } catch (err) {
      console.log(err);
      modalAlert("Err: could not upload file");
      return;
    }

    start = end;
  }

  // finished
  modalAlert("Successfully uploaded file");

  // clears items
  document.getElementById("fileInput").value = "";
  document.getElementById("fileId").value = "";
}

// review approvals: display
function displayReviewApprovals(id) {
  const box = document.getElementById("reviewApprovals");
  apiCall(
    `/review/fetch/all?id=${id}`,
    "GET",
    undefined,
    undefined,
    function (resp) {
      let json = resp.body;
      if (resp.status == 200) {
        if (json.length == 0) {
          box.innerHTML = "<i>There exists no reviews</i>";
        } else {
          reviewApprovalsPrettifier(json, id);
        }
      } else {
        box.innerHTML = `<i>Error fetching reviews: ${json.message}</i>`;
      }
    }
  );
}

// review approvals: displays it
function reviewApprovalsPrettifier(json, movieId) {
  const box = document.getElementById("reviewApprovals");

  // filters
  let toApprove = [];
  let approved = [];
  for (var i = 0; i < json.length; i++) {
    if (json[i].approved) {
      approved.push(json[i]);
    } else {
      toApprove.push(json[i]);
    }
  }

  // puts it in: to be approved
  let toPut = `<h5 id="toApprovePanelToggle" onclick="togglePanel('toApprove')">Reviews to approve (click to show)</h5><div id="toApprovePanelInner" style="display: none;">`;
  if (toApprove.length == 0) {
    toPut += "<i>Nothing to approve</i>";
  } else {
    for (var i = 0; i < toApprove.length; i++) {
      let q = toApprove[i];
      toPut += `<div class="reviewApp"><p>${q.review}</p><button id="ap${q.id}" onclick="reviewAction('approve','${q.id}')">Approve</button> <button id="rm${q.id}" onclick="reviewAction('remove','${q.id}')">Remove</button></div>`;
    }
  }

  // puts it in: approved
  toPut += `</div><h5 id="approvedRevPanelToggle" onclick="togglePanel('approvedRev')">Reviews already approved (click to show)</h5><div id="approvedRevPanelInner" style="display: none;">`;
  if (approved.length == 0) {
    toPut += "<i>Nothing has been approved</i>";
  } else {
    for (var i = 0; i < approved.length; i++) {
      let q = approved[i];
      toPut += `<div class="reviewApp"><p>${q.review}</p><button id="rm${q.id}" onclick="reviewAction('remove','${q.id}')">Remove</button></div>`;
    }
  }
  toPut += "</div>";

  // adds section with the form
  toPut += `<form><input type="hidden" id="reviewFormApprovals"><input type="hidden" id="reviewFormRemovals"><input type="hidden" id="reviewFormId" value="${movieId}"><input type="submit" id="reviewFormSubmit" value="Commit Review Changes" style="display:none;"></form>`;

  box.innerHTML = toPut;

  document
    .getElementById("reviewFormSubmit")
    .addEventListener("click", commitReviewChanges, false);
}

// review approvals: action buttons
function reviewAction(mode, id) {
  document.getElementById("reviewFormSubmit").style.display = "block";

  let inpBox;
  let inpButton;
  if (mode == "approve") {
    inpBox = document.getElementById("reviewFormApprovals");
    inpButton = document.getElementById(`ap${id}`);
  } else {
    inpBox = document.getElementById("reviewFormRemovals");
    inpButton = document.getElementById(`rm${id}`);
  }

  let alreadyIn = false;
  if (inpBox.value.includes(id)) {
    alreadyIn = true;
  }

  if (alreadyIn == true) {
    inpBox.value = inpBox.value.replace(`${id},`, "");
    inpButton.style.backgroundColor = "";
  } else {
    inpBox.value = `${inpBox.value}${id},`;
    if (mode == "approve") {
      inpButton.style.backgroundColor = "green";
    } else {
      inpButton.style.backgroundColor = "red";
    }
  }
}

// commits review changes
function commitReviewChanges(event) {
  event.preventDefault();

  const approved = document.getElementById("reviewFormApprovals").value;
  const removals = document.getElementById("reviewFormRemovals").value;
  const movieId = document.getElementById("reviewFormId").value;

  let approvals = [];
  let deletion = [];
  if (approved) {
    approvals = approved.split(",");
  }
  if (removals) {
    deletion = removals.split(",");
  }

  apiCall(
    `/review/approvals`,
    "POST",
    { movieId, approvals, deletion },
    undefined,
    function (resp) {
      if (resp.status == 200) {
        modalAlert("Approved and deleted reviews as specified.");
        displayReviewApprovals(movieId);
      } else {
        modalAlert(`Error: ${resp.body.message}`);
      }
    }
  );
}
