# API Reference: Airline Streaming

## General Schematic

### For viewing - all are GET methods

| Endpoint | Response Content-Type | Description |
| --- | --- | --- |
| / | text/html | The main front page, accessible to passengers |
| /crew | text/html | The page with settings, accessible to staff |
| /style.css | text/css | The CSS for main and crew pages |
| /script.js | text/javascript | The JavaScript which goes behind the main and crew page, frontend |
| /scriptCrew.js | text/javascript | The JavaScript which goes behind the crew page only, frontend |
| /plyr.css | text/css | The CSS for Plyr, the video player display |
| /plyr.js | text/javascript | The JavaScript for Plyr, the video player display |

### All other services

Please assume that all of these have a `Content-Type` of `application/json` unless otherwise specified. Please note these APIs will be in further detail below.

| Endpoint | Method | Description |
| --- | --- | --- |
| /message/fetch | GET | Gets all messages made in the recent 30 seconds from crew, as well as checking if a connection is still active between server and client |
| /message/send | POST | Restricted to staff - sends a message to all users who are subscribed to the `/message/fetch GET` |
| /film/categoryfilter/fetch | GET | Fetches a list of all movies in a specified category |
| /film/individual/metadata | GET | Gets the data for a specified movie |
| /film/individual/thumbnail | GET | Returns `image/jpeg`, the thumbnail of a specified movie |
| /film/individual/video | GET | Returns `video/mp4` on success, or `text/txt` on failure, the film content (or an error) |
| !!/film/individual/new | POST | Creates a new film in the database |
| /review/fetch | GET | Fetches all reviews for a movie, as long as they are approved |
| !!/review/fetch/all | GET | Fetches all reviews for a movie, including those which are not approved |
| /review/send | POST | Sends a review of a movie, which is to be approved |
| !!/review/approvals | POST | To approve, or to delete, any reviews. |
| !!/flight/data | POST | Updates the flight's data |
| /authenticate | POST | Authenticates a password on log in |
| !!/authenticate/new | POST | Changes a password |
| /authenticate/token | POST | Checks a token's entitlements |
