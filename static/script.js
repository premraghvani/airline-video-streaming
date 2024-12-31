let currentMovie = 0;
let lastRead = 0;

// generic function which calls API using AJAX - for JSON in, JSON out
function apiCall(endpoint, method, body = {}, headers = {}, callback) {
  // set up
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      let respText = this.responseText;
      if (!respText) {
        respText = "{}";
      }
      callback({ status: this.status, body: JSON.parse(respText) });
    }
  };

  // header values
  let headerKeys = Object.keys(headers);
  for (key in headerKeys) {
    xhttp.setRequestHeader(key, headers[key]);
  }

  // timeout, and error cases (when server down or unreachable)
  xhttp.onerror = function () {
    callback({
      status: 0,
      body: {
        message: "Network error or server unreachable",
      },
    });
  };
  xhttp.timeout = 2000;
  xhttp.ontimeout = function () {
    callback({
      status: 0,
      body: {
        message: "Request timed out - perhaps the server is unreachable",
      },
    });
  };

  // send
  xhttp.open(method, endpoint, true);

  if (endpoint == "GET") {
    xhttp.send();
  } else {
    xhttp.send(JSON.stringify(body));
  }
}

// function to select movie, close menu and open the movie
function selectMovie(id) {
  // attempts to retrieve metadata
  apiCall(
    `/film/individual/metadata?id=${id}`,
    "GET",
    undefined,
    undefined,
    function (resp) {
      if (resp.status == 200) {
        let json = resp.body;

        // show movie block
        document.getElementById("libraries").style.display = "none";
        document.getElementById("content").style.display = "block";
        document.getElementById("categoryLibrary").style.display = "none";
        // add its metadata on the screen
        document.getElementById("filmTitle").innerHTML = json.title;
        document.getElementById("filmDescription").innerHTML = json.description;
        document.getElementById(
          "filmYearGenre"
        ).innerHTML = `${json.year} | ${json.genre}`;
        document.getElementById(
          "filmCast"
        ).innerHTML = `Directed by ${json.director}<br>Cast: ${json.cast}`;
        document
          .getElementById("backFilm")
          .setAttribute("onClick", `openCategory("${json.genre}")`);

        // adds video
        var source = document.createElement("source");
        source.src = `film/individual/video?id=${id}`;
        source.type = "video/mp4";
        document.getElementById("filmVideo").appendChild(source);
      } else {
        modalAlert(
          `We are sorry but we could not load that movie, due to: ${resp.body.message}`
        );
      }
    }
  );
  currentMovie = id;
}

// function to go back to menu, saving any timestamps
function goBack() {
  document.getElementById("libraries").style.display = "block";
  document.getElementById("content").style.display = "none";
  document.getElementById("categoryLibrary").style.display = "none";
  disconnectFilm();
}

// function to check the connection and update page accordingly, and messages - puts modal if disconnected for more than 20 seconds
let disconnectedTicks = 0;
function checkConnection() {
  let current = document.getElementById("availabilityStatus");

  apiCall(`/message/fetch`, "GET", undefined, undefined, function (resp) {
    if (resp.status !== 200) {
      if (current.innerHTML !== "Unavailable") {
        current.innerHTML = "Unavailable";
        current.style = "color: #800;";
      }
      disconnectedTicks += 1;
    } else {
      if (current.innerHTML !== "Available") {
        current.innerHTML = "Available";
        current.style = "color: #080;";
        disconnectedTicks = 0;
      }

      if (resp.body.messages.length != 0) {
        let messageToShow = [];
        for (var i = 0; i < resp.body.length; i++) {
          if (lastRead < resp.body[i].timestamp) {
            messageToShow.push(resp.body[i].message);
            lastRead = resp.body[i].timestamp;
          }
        }
        if (messageToShow.length > 0) {
          modalAlert(
            `<b>Message from Crew:</b><br><br>${messageToShow.join("<br>")}`
          );
        }
      }
    }
  });
  if (disconnectedTicks == 10) {
    modalAlert(
      "<b>Disconnection</b><br>The connection with the server has been lost for more than 20 seconds, however if it is back, the top bar will say 'Available' in green for service availability. This does mean you aren't able to view any content until the connection is available. This may be due to you being disconnected from our Wi-Fi, or our server being down."
    );
  }
}

// check connection with the server every 2 seconds
checkConnection();
setInterval(checkConnection, 2000);

// checks flight info
flightInfoLoad();

// open a category's library
function openCategory(cat) {
  disconnectFilm();
  // attempts to get category films
  apiCall(
    `/film/categoryfilter/fetch?category=${cat}`,
    "GET",
    undefined,
    undefined,
    function (resp) {
      if (resp.status == 200) {
        let json = resp.body;
        if (json.length == 0) {
          return;
        } else {
          // show the category block
          document.getElementById("libraries").style.display = "none";
          document.getElementById("categoryLibrary").style.display = "block";
          document.getElementById("content").style.display = "none";

          // generates the body
          let top = `<h2>${cat.toUpperCase()} MOVIES</h2><p>Have an explore of our ${cat.toLowerCase()} movie collection! Please don't hesitate to ask your cabin crew today for anything small, such as popcorn, to make your experience more comfortable! (We aren't Ryanair, we will give you good popcorn)</p>`;
          let body = "";
          for (var i = 0; i < json.length; i++) {
            let film = json[i];
            body += `<div class="film" onclick="selectMovie(${film.id})">
                        <img src="/film/individual/thumbnail?id=${film.id}" alt="Thumbnail for ${film.title}">
                        <p>${film.title}</p>
                    </div> `;
          }

          // embeds the video
          document.getElementById("movieContainer").innerHTML = body;
          document.getElementById("movieTop").innerHTML = top;
        }
      } else {
        modalAlert(
          `We are sorry but we could not load the genre, due to: ${resp.body.message}`
        );
      }
    }
  );
}

// disconnects a film
function disconnectFilm() {
  document.getElementById("filmVideo").innerHTML = "";
  document.getElementById("filmVideo").load();
  document.getElementById("review").value = "";
  document.getElementById("movieIdReview").value = "";
  currentMovie = 0;
  if (document.getElementById("filmReviews").style.display != "none") {
    toggleFilmReviews();
  }
}

// toggles film reviews
function toggleFilmReviews() {
  const reviewsBox = document.getElementById("filmReviews");
  const button = document.getElementById("filmReviewsToggle");
  const writeReviewId = document.getElementById("movieIdReview");
  const filmReviewContent = document.getElementById("filmReviewContent");

  // if there is no review box open
  if (reviewsBox.style.display == "none") {
    reviewsBox.style.display = "block";
    button.innerHTML = "Hide Film Reviews";
    writeReviewId.value = currentMovie;

    // fetches the reviews
    apiCall(
      `/review/fetch?id=${currentMovie}`,
      "GET",
      undefined,
      undefined,
      function (resp) {
        if (resp.status == 200) {
          let json = resp.body;
          if (json.length == 0) {
            filmReviewContent.innerHTML = "<i>No Reviews</i>";
            return;
          } else {
            // generates the content
            let reviewContent = "";
            for (var i = 0; i < json.length; i++) {
              let review = json[i];
              reviewContent += `<div class="review">
                            <blockquote class="reviewItem">${
                              review.review
                            }</blockquote>
                            <p class="reviewCaption">Reviewed on flight ${
                              review.flight
                            } about ${relativeTime(review.timestamp)} ago</p>
                        </div>`;
            }
            // embeds the review
            filmReviewContent.innerHTML = reviewContent;
          }
        } else {
          filmReviewContent.innerHTML = "<i>No Reviews</i>";
        }
      }
    );

    // if there is a review box
  } else {
    reviewsBox.style.display = "none";
    button.innerHTML = "Show Film Reviews (Spoiler Alert!)";
    writeReviewId.value = "";
  }
}

// relative timestamp, e.g. finds how far ago something was
function relativeTime(timeThen) {
  const d = new Date();
  let timeNow = Math.floor(d.getTime() / 1000);
  let timeDiff = timeNow - timeThen;
  if (timeDiff == 1) {
    return "1 second";
  } else if (timeDiff < 120) {
    return `${Math.round(timeDiff)} seconds`;
  } else if (timeDiff < 120 * 60) {
    return `${Math.round(timeDiff / 60)} minutes`;
  } else if (timeDiff < 48 * 60 * 60) {
    return `${Math.round(timeDiff / 60 / 60)} hours`;
  } else {
    return `${Math.round(timeDiff / 60 / 60 / 24)} days`;
  }
}

// submit reviews form
document
  .getElementById("reviewsend")
  .addEventListener("click", submitReviews, false);
function submitReviews(event) {
  // sets up basics
  event.preventDefault();
  let review = document.getElementById("review").value;
  let movieId = document.getElementById("movieIdReview").value;
  // input validation
  if (/^[A-Za-z0-9 \.,\-!?'"()]{1,256}$/.test(review) == false || !review) {
    modalAlert(
      "This review can not be accepted, as we only allow letters (A-Z, a-z), numbers (0-9), spaces, or the following symbols: .,-!?'\"() - up to 256 characters"
    );
    return;
  }
  // sends the request
  apiCall(
    `/review/send`,
    "POST",
    { review, movieId },
    undefined,
    function (resp) {
      if (resp.status == 202) {
        modalAlert("Successfully submitted review!");
        document.getElementById("review").value = "";
        document.getElementById("movieIdReview").value = "";
      } else {
        modalAlert(`Error: ${json.message}`);
      }
    }
  );
}

// modal alert
function modalAlert(msg) {
  let modal = document.getElementById("modal");
  let closeButton = document.getElementById("closeBtn");
  document.getElementById("modalText").innerHTML = msg;
  modal.style.display = "block";
  closeButton.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// changes the flight info on load
function replaceInDoc(phrase, replacement) {
  const elements = document.querySelectorAll(`.toreplace-${phrase}`);
  if (elements.length > 0) {
    elements.forEach((element) => {
      element.textContent = replacement;
    });
  }
}
function flightInfoLoad() {
  apiCall(`/flight`, "GET", undefined, undefined, function (resp) {
    if (resp.status == 200) {
      for (key in resp.body) {
        replaceInDoc(key, resp.body[key]);
      }
    }
  });
}
