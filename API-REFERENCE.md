# API Reference: Airline Streaming

## General Schematic

### For viewing ("statics") - all are GET methods

| Endpoint | Response Content-Type | Description |
| --- | --- | --- |
| / | text/html | The main front page, accessible to passengers |
| /crew | text/html | The page with settings, accessible to staff |
| /style.css | text/css | The CSS for main and crew pages |
| /script.js | text/javascript | The JavaScript which goes behind the main and crew page, frontend |
| /scriptCrew.js | text/javascript | The JavaScript which goes behind the crew page only, frontend |
| /plyr.css | text/css | The CSS for Plyr, the video player display |
| /plyr.js | text/javascript | The JavaScript for Plyr, the video player display |

### All other API services

Please assume that all of these have a `Content-Type` of `application/json` request body and response body, unless otherwise specified. Please note these APIs will be in further detail below.

| Endpoint | Method | Description |
| --- | --- | --- |
| [/message/fetch](#messagefetch-get) | GET | Gets all messages made in the recent 30 seconds from crew, as well as checking if a connection is still active between server and client |
| [/message/send](#messagesend-post) | POST | Restricted to staff - sends a message to all users who are subscribed to the `/message/fetch GET` |
| [/film/category/fetch](#filmcategoryfetch-get) | GET | A list of all categories which exist |
| [/film/categoryfilter/fetch](#fimcategoryfilterfetch-get) | GET | Fetches a list of all movies in a specified category |
| [/film/individual/metadata](#filmindividualmetadata-get) | GET | Gets the data for a specified movie |
| [/film/individual/thumbnail](#filmindividualthumbnail-get) | GET | Returns `image/jpeg`, the thumbnail of a specified movie |
| [/film/individual/video](#filmindividualvideo-get) | GET | Returns `video/mp4` on success, or `text/txt` on failure, the film content (or an error) |
| [/film/individual/new/metadata](#filmindividualnewmetadata-post) | POST | Creates a new film in the database |
| [/film/individual/new/multimedia](#filmindividualnewmultimedia-put) | PUT | Uploads film's multimedia |
| [/film/individual/edit](#filmindividualedit-post) | POST | Edits a film |
| [/film/individual/delete](#filmindividualdelete-post) | POST | Deletes a film |
| [/review/fetch](#reviewfetch-get) | GET | Fetches all reviews for a movie, as long as they are approved |
| [/review/fetch/all](#reviewfetchall-get) | GET | Fetches all reviews for a movie, including those which are not approved |
| [/review/send](#reviewsend-post) | POST | Sends a review of a movie, which is to be approved |
| [/review/approvals](#reviewapprovals-post) | POST | To approve, or to delete, any reviews. |
| [/flight](#flight-get) | GET | The flight's current data |
| [/flight/data](#flightdata-post) | POST | Updates the flight's data |
| [/authenticate](#authenticate-post) | POST | Authenticates a password on log in |
| [/authenticate/change](#authenticatechange-post) | POST | Changes a password (crew or admin) |
| [/authenticate/token](#authenticatetoken-post) | POST | Checks a token's entitlements |

## Extra Details on API

The `application/json` request and response applies to everything except:
- The response on the successful and failed case of [/film/individual/thumbnail](#filmindividualthumbnail-get)
- The response on the successful case of [/film/individual/video](#filmindividualvideo-get) (failure still provides a json)
- The request of [/film/individual/new/multimedia](#filmindividualnewmultimedia-put)

Please note that in the response body for errors and select successes, where the response body is `application/json` the following key will always exist: `message` - this will contain more information, such as what has exactly caused the error, or a simple "Success!" if it is a success without anything needing to be passed back to the client. Status codes will always be passed back, with 2xx being successful cases, 4xx being failed (client's fault), and 5xx being failed (server's fault).

This will only apply to services which aren't in the "statics" section.
Please note that the code examples are in a JavaScript example, where we assume the following command is true:

```js
await fetchData(endpoint,method,payload,reqHeaders)
```

This will act as an API call, where the data is returned, and:
- `endpoint` is the HTTP endpoint
- `method` is the method used, either `get` for `GET`, or `post` for `POST`
- `payload` which may be blank, but is a JSON with the request
- `reqHeaders` which may be blank, but is any different request headers. This is a JSON with the key being the header name, and value being its content.

We assume that the response will be an object with the following keys:
- `body` contains the body.
- `headers` contains the response headers.

This can be adapted to whatever is used in your programming language to make requests, e.g. axios.

Assume that the code examples are running in an async environment.

The expectation is that the payload to POST requests are only in application/json (or are left blank), and any information for GET requests are given as a querystring.

Please note that `{{token}}` will refer to a token, either given by the server, or something which is provided back to the server, usually via the Cookie header. By default, tokens expire 60 minutes after issue. A token will adhere to the following regex: `^[a-f0-9]{64}+$`

## /message/fetch GET

This is a blanket request to get all messages. This method has been used in the design of the main app for checking if there is a connection with the server as well as getting any new messages.

```js
// request
let request = await fetchData("/message/fetch", "get")

// response
console.log(request.body)
```

Expected response on success:

```json
[
    {
        "message":"Testing 1 2 3",
        "timestamp":1734630618
    },
    {
        "message":"Testing 4 5 6",
        "timestamp":1734630620
    },
]
```

This API will only give the messages from the last 30 seconds, and it is an array of JSONs, where:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| message | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The actual message body |
| timestamp | Integer: integer > 0 | The unix timestamp the server recieved the message (seconds from 01/JNR/1970 00:00 UTC+0) |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We found the messages |
| 500 | We couldn't find the messages - server messed up |

## /message/send POST

> This API is restricted to those with a valid crew or admin token

This is the way to send a message as a member of staff to be viewed in message fetches.

```js
// request
let body = {
    "message":"Testing 1 2 3"
}
let headers = {
    "Cookie":"token={{token}}"
}
let request = await fetchData("/message/send", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "message":"Success!"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| message | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The actual message body |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and correctly updated the message database as prescribed |
| 400 | You did not provide a message, or it was not in the format as requested |
| 403 | There is no token provided, or it is invalid (could be expired) |

## /film/category/fetch GET

This is a way to get a list of all categories that exists, in alphabetical order.

```js
// request
let request = await fetchData("/film/category/fetch", "get")

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "categories":["action", "autobiography"]
}
```

This API will give one response:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| categories | Array of strings: /^[a-z]+$/ | List of categories, all lowercase alphabetical text |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you all the categories we have |
| 500 | We couldn't find the categories - server messed up |

## /fim/categoryfilter/fetch GET

This is a way to get all movies that exists in a given category. The category name is passed in as a querystring.

```js
// request
let category = "action"
let request = await fetchData(`/film/categoryfilter/fetch?category=${category}`, "get")

// response
console.log(request.body)
```

Expected response on success:

```json
[
  {
    "id": 2,
    "title": "Can goes on a Journey with speed",
    "genre": "Action",
    "year": 2024
  },
  {
    "id": 3,
    "title": "Sprite vs Pineapple Juice",
    "genre": "Action",
    "year": 2024
  }
]
```

The API will expect the following items in the querystring:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| category | String: /^[A-Za-z]+$/ | Category name (case insensitive) |

This API will give an array of objects in its response on success, with the object containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | Integer: integer > 0 | The unique numerical ID of a given film |
| title | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The title of the movie |
| genre | String: /^[A-Za-z]+$/ | The genre of the movie |
| year | Integer: integer > 0 | The year of the movie's release |


Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you all the movies in the category |
| 400 | You haven't specified the category, either at all or in the correct format |
| 404 | The category does not exist |

## /film/individual/metadata GET

This is a way to get detailed metadata on a given movie. The movie ID is passed in as a querystring.

```js
// request
let movie = 1
let request = await fetchData(`/film/individual/metadata?id=${id}`, "get")

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "id": 1,
  "title": "Can goes on a Journey",
  "description": "This 7up can is going on a voyage, I wonder, will it get to its destination safely?",
  "cast": "Can",
  "director": "Evil Developer",
  "year": 2024,
  "genre": "Autobiography"
}
```

The API will expect the following items in the querystring:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9]+$/ | Movie's ID |

This API will give an object in its response on success, with the object containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | Integer: integer > 0 | The unique numerical ID of a given film (this is the string passed in, but parsed as an integer) |
| title | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The title of the movie |
| genre | String: /^[A-Za-z]+$/ | The genre of the movie |
| year | Integer: integer > 0 | The year of the movie's release |
| description | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The description of the movie |
| director | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The director of the movie |
| cast | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The cast members' name(s) of the movie |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you the metadata |
| 400 | You haven't specified the movie ID, either at all or in the correct format |
| 404 | The movie does not exist |

## /film/individual/thumbnail GET

This is a way to get the thumbnail on a given movie. The movie ID is passed in as a querystring. 

> This API will give an `image/jpeg` response, instead of the usual `application/json` response for all responses (including errors).

```js
// request
let movie = 1
let request = await fetchData(`/film/individual/thumbnail?id=${id}`, "get")
```

As the response is an image, we can not show it here.

The API will expect the following items in the querystring:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9]+$/ | Movie's ID |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you the thumbnail |
| 400 | You haven't specified the movie ID, either at all or in the correct format, but we have given you a generic thumbnail image |
| 404 | The movie does not exist, but we have given you a generic thumbnail image |
| 500 | We could not find a thumbnail, nor a generic thumbnail (in this case, the response is blank) |

## /film/individual/video GET

This is a way to get the actual video content of a given movie. The movie ID is passed in as a querystring. 

> This API will give a `video/mp4` response, instead of the usual `application/json` response for all successful responses, and `text/txt` on failures. You must also be careful about headers, as the system will only give at most 2 MB of the video in the body, you must re-request, amending the range headers to construct the entire video.

In the example below, `{{start}}` is a required integer to indicate the start of the range. In your initial request, this could be 0. There is a dash in the header since the Range header does suggest you put an end, but the system already calculates the end, which is the minimum endpoint of the end of the movie, or 2 MB from the start (the start byte is included in the calculation). However, if your `{{start}}` is greater than the video size, it will be rejected.

In this system, 2 MB means 2 * 10^6 Bytes.

In the example below, assume `{{start}}` to be 0.

```js
// request
let movie = 1
let headers = {
    "Range":"bytes={{start}}-"
}
let request = await fetchData(`/film/individual/video?id=${id}`, "get", null, headers)

// response (assuming success, headers only)
console.log(request.headers)
```

Response headers:
```json
{
    "Content-Range":"bytes 0-499999/1244043",
    "Accept-Ranges":"bytes",
    "Content-Type":"video/mp4",
    "Content-Length":500000
}
```

Please note that the above example was for when only 500 KB could be sent back (500,000 bytes). In reality, this will be 2 MB (2,000,000 bytes).

The way Content-Range works, means that the format of the response is: `bytes {{start}}-{{end}}/{{size}}`

Where `{{start}}` is the start byte, `{{end}}` is the end byte, and `{{size}}` is the size of the entire video. On the last packet of information, the `{{end}}` will be 1 byte less than `{{size}}`.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 206 | We have partial content for the video* |
| 400 | Either your range headers are missing, or the movie ID is invalid |
| 404 | We could not find the movie for the given ID |
| 416 | The range is invalid |
| 500 | The server messed up in fulfilling your request |

*This will however be the response even if the entire video is less than 500KB, but your checks where `{{end}}+1 == {{size}}` is true should catch this as the end anyways.

## /film/individual/new/metadata POST

> This API is restricted to those with a valid admin token. Please also note that calling this API is often a pre-requesite to the new multimedia (unless you're editing a movie's video or thumbnail, in which case the edit API is the pre-requestie.) Please also note that if you do make a new movie by metadata, but do not upload a thumbnail / video by /film/individual/new/multimedia POST, then on the next startup of the server, the metadata will be deleted.

This is the first steo in the way to make a new movie.

```js
// request
let body = {
    "title":"Into the Matrix",
    "description":"The matrix is very important, M mxn (Real). Professor Lobb especially needs this, in order to deliver lectures on Linear Algebra.",
    "year":2025,
    "genre":"documentary",
    "cast":"Professor Lobb, T-Shirt Department",
    "director":"Durham University Mathematical Sciences"
}
let headers = {
    "Cookie": "token={{token}}"
}
let request = await fetchData("/film/individual/new/metadata", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "message": "Success!",
  "id":4
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| title | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The title of the movie |
| genre | String: /^[A-Za-z]+$/ | The genre of the movie |
| year | Integer: integer > 0 | The year of the movie's release |
| description | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The description of the movie |
| director | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The director of the movie |
| cast | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The cast members' name(s) of the movie |

This API will give an array of objects in its response on success, with the objects containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | Integer: integer > 0 | The id the film has been allocated |
| message | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The system's message (not important on success) |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have created the metadata |
| 400 | Any of the following did not exist or wasn't in the correct format in the body: title, genre, year, description, director, cast |
| 403 | You have not authenticated yourself as an admin |
| 500 | We could not deliver on your request due to an internal server error |

## /film/individual/new/multimedia PUT

> This API is restricted to those with a valid admin token. Please also beware of the headers that you use - they are described here. A pre-requesite of this API is either to run /film/individual/new/metadata POST, and taking the id returned as the movie ID, or running /film/individual/edit POST and requesting for a change in thumbnail and/or movie video, and taking the movie ID as the movie ID in this API.

The API will only accept
1. video/mp4 - if this is given, it will be assumed to be the video
2. image/jpeg - if this is given, it will be assumed to be the thumbnail

Here are the headers which must be given:
| Header | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| Content-Type | String: `video/mp4` or `image/jpeg` | The content type of the content, MP4 or JPEG |
| X-Request-ID | String: /^[0-9]+$/ | The movie ID |
| Cookie | String: contains `token={{token}}` | The authentication token, where `{{token}}` is a valid admin token |
| Content-Range | String: `bytes {{start}}-{{end}}/{{size}}` | The range of the data given |

Please note we accept a maximum 2 MB (2*10^6 Bytes) in the body at once.

These MIMEs must be given in the headers. Here is an example uploading a video:

```js
const contentPath = "/path/to/content.mp4"
const fs = require("fs");

let bitEnd = -1;
let continuation = true;
let size = fs.statSync(contentPath).size;

// requests
let headers = {
    "Cookie": "token={{token}}",
    "X-Request-ID": "4", // this is the movie's ID, as a string
    "Content-Type": "video/mp4" // replace with image/jpeg for the thumbnail
}
while(continuation){
    // finds the start and end, such that it is no more than 2MB in size
    let start = bitEnd + 1;
    let end = bitEnd + 2000000;
    
    // checks if this is the last 2MB packet
    if(end > (size - 1)){
        end = size - 1;
    }
    if(end == (size - 1)){
        continuation = false;
    }

    // updates the end bit, and headers
    bitEnd = end;
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`

    // gets the body
    const body = await new Promise((resolve, reject) => {
        const chunks = [];
        const stream = fs.createReadStream(contentPath, { start, end });
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });

    let request = await fetchData("/film/individual/new/multimedia", "put", body, headers)
    if(request.status !== 200){
        console.log("Error at point:",start,end)
    }
}
```

The body must be the binary. Although the system will provide a JSON response with status code, it is not important, and is only useful for error diagnostics.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have accepted the part given |
| 400 | The headers we need aren't provided / in the correct format, the size of the body is too big, or `Content-Range` makes no sense (e.g. due to itself, or the body size not matching up) |
| 403 | You have not authenticated yourself as an admin |
| 500 | We could not upload the part of the movie for some reason |

## /film/individual/edit POST

> This API is restricted to those with a valid admin token. Please also note that calling this API is often a pre-requesite to the new multimedia if you specify that you want to change the video or thumbnail in this transaction (unless you're making a new movie, in which case the new metadata API is the pre-requestie.) Please also note that if you request to change the thumbnail / video / both, but do not upload a thumbnail / video by /film/individual/new/multimedia POST, then like the new metadata, on the next startup of the server, the entire movie will be deleted. This is because this API will also delete the existing thumbnail / video to make way for the other content.

This is the way to edit an existing movie's metadata, and first step in changing an existing movie's thumbnail or video

```js
// request
let body = {
    "id":3,
    "cast":"Can, Juicebox, Physics",
    "newThumbnail":true
}
let headers = {
    "Cookie": "token={{token}}"
}
let request = await fetchData("/film/individual/new/metadata", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "message": "Success!"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | Integer: integer > 0 | The ID of the movie |
| title | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The title of the movie |
| genre | String: /^[A-Za-z]+$/ | The genre of the movie |
| year | Integer: integer > 0 | The year of the movie's release |
| description | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The description of the movie |
| director | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The director of the movie |
| cast | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The cast members' name(s) of the movie |
| newVideo | Boolean | Whether or not you want to delete the current video, and use the /film/individual/new/multimedia API to upload a new video |
| newThumbnail | Boolean | Whether or not you want to delete the current video, and use the /film/individual/new/multimedia API to upload a new video |

Only `id` is required, the rest are optional. If they are not specified, we assume that the content for that key remains the same. We only change anything that is specified.

This API will only give a response body which is important for informational use only.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have actioned it |
| 400 | A field that you did specify is in the incorrect format, or there is no id |
| 403 | You have not authenticated yourself as an admin |
| 404 | The specified film does not exist |
| 500 | We could not deliver on your request due to an internal server error |

## /film/individual/delete POST

> This API is restricted to those with a valid admin token

This is the way for an admin to delete a film

```js
// request
let body = {
    "id": "1",
    "title": "Can goes on a Journey"
}
let headers = {
    "Cookie":"token={{token}}"
}
let request = await fetchData("/film/individual/delete", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "message":"Success!"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9]+$/ | The id of the movie you want to delete |
| title | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The title of the movie you want to delete |

Please note that the title is also required, as a protection measure (especially if you are making requests via cURL).

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have deleted the movie |
| 400 | Something in the body is not in the correct format or not included |
| 403 | There is no token provided, or it is invalid (could be expired, or crew only) |
| 404 | We couldn't find the movie in question |
| 406 | The movie ID and title do not match up |

## /review/fetch GET

This is a way to get all approved reviews of a given movie.

```js
// request
let movieId = "3"
let request = await fetchData(`/review/fetch?id=${movieId}`, "get")

// response
console.log(request.body)
```

Expected response on success:

```json
[
  {
    "timestamp": 1734301797,
    "flight": "EK 018",
    "review": "Wow! This really had me clutching my seat, so tense, such a good movie!",
    "approved": true,
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
]
```

The API will expect the following items in the querystring:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9]+$/ | Movie's ID |

This API will give an array of objects in its response on success, with the objects containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ | The unique UUID of the review |
| flight | String: /^[A-Za-z0-9 ]+$/ | The flight number this review was reviewed on |
| timestamp | Integer: integer > 0 | The timestamp of the review, in unix (seconds from 01/JNR/1970 00:00 UTC+0) |
| review | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The review's content |
| approved | Boolean | Whether or not the review has been approved |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you the approved reviews |
| 400 | You haven't specified the movie ID, either at all or in the correct format |
| 404 | The movie does not exist (hence the reviews don't) |

## /review/fetch/all GET

> This API is restricted to those with a valid admin token

This is a way to get all reviews made of a given movie.

```js
// request
let movieId = "3"
let headers = {
    "Cookie":"token={{token}}"
}
let request = await fetchData(`/review/fetch/all?id=${movieId}`, "get", null, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
[
  {
    "timestamp": 1734301797,
    "flight": "EK 018",
    "review": "Wow! This really had me clutching my seat, so tense, such a good movie!",
    "approved": true,
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  },
  {
    "timestamp": 1734301800,
    "flight": "EK 018",
    "review": "i hate this airline, ryanair is better",
    "approved": false,
    "id": "ab1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
]
```

The API will expect the following items in the querystring:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9]+$/ | Movie's ID |

This API will give an array of objects in its response on success, with the objects containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| id | String: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ | The unique UUID of the review |
| flight | String: /^[A-Za-z0-9 ]+$/ | The flight number this review was reviewed on |
| timestamp | Integer: integer > 0 | The timestamp of the review, in unix (seconds from 01/JNR/1970 00:00 UTC+0) |
| review | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The review's content |
| approved | Boolean | Whether or not the review has been approved |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you the approved reviews |
| 400 | You haven't specified the movie ID, either at all or in the correct format |
| 403 | You haven't authenticated yourself with an admin's token |
| 404 | The movie does not exist (hence the reviews don't) |

## /review/send POST

This is the way to post a review about a movie.

```js
// request
let body = {
    "review":"Testing 1 2 3",
    "movieId":"1"
}
let request = await fetchData("/message/send", "post", body)

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "message":"Accepted for Moderation"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| review | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The actual message body |
| movieId | String: /^[0-9]+$/ | The movie's ID |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 202 | We recieved your request, and have taken it, but it is to be moderated manually |
| 400 | You did not provide a review and/or movie ID, or it was not in the format as requested |
| 404 | The movie corresponding to the ID given does not exist |

## /review/approvals POST

> This API is restricted to those with a valid admin token

This is the way to approve and/or delete review(s) about a movie. You must do at least one of approvals or deletions, but can do both in the same transaction.

```js
// request
let body = {
    "movieId":"1",
    "approvals":[
        "1c80d54c-267e-4db1-9fa5-b38a4fa6591c"
    ]
    "deletion":[
        "93a3fc5f-f584-4bcb-8d42-96d32a00b336"
    ]
}
let headers = {
    "Cookie": "token={{token}}"
}
let request = await fetchData("/message/send", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "success": "Changes made"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| movieId | String: /^[0-9]+$/ | The movie's ID |
| deletion | Array of strings: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ | An array containing all IDs for reviews on the movie, those reviews being the ones you want to permanently delete |
| approvals | Array of strings: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ | An array containing all IDs for reviews on the movie, those reviews being the ones you want to approve of |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have taken action as prescribed |
| 400 | You did not provide a any review to either delete or approve, and/or movie ID, or it was not in the format as requested |
| 403 | You have not authenticated yourself as an admin |
| 404 | The movie corresponding to the ID given does not exist (thus reviews do not exist) |

## /flight GET

This is a way to get the flight's data.

```js
let request = await fetchData(`/flight`, "get")

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "origin": "Manchester",
    "destination": "Dubai",
    "originCode": "MAN",
    "destinationCode": "DXB",
    "flightNum": "EK 018"
}
```

This API will give an object in its response on success, with the object containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| origin | String: /^[A-Za-z0-9 ]+$/ | The flight's origin (city name) |
| destination | String: /^[A-Za-z0-9 ]+$/ | The flight's destination (city name) |
| originCode | String: /^[A-Za-z]{3}$/ | The flight's origin (IATA code) |
| destinationCode | String: /^[A-Za-z]{3}$/ | The flight's destination (IATA code) |
| flightNum | String: /^[A-Za-z0-9 ]+$/ | The flight number |

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We have successfully given you the flight info |
| 500 | We couldn't get you the flight info |

## /flight/data POST

> This API is restricted to those with a valid crew or admin token

This is the way for a member of staff to update a flight's information

```js
// request
let body = {
    "origin": "London Heathrow",
    "destination": "Doha",
    "originCode": "LHR",
    "destinationCode": "DOH",
    "flightNum": "QR 004"
}
let headers = {
    "Cookie":"token={{token}}"
}
let request = await fetchData("/flight/data", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
  "message":"Success!"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| origin | String: /^[A-Za-z0-9 ]+$/ | The flight's origin (city name) |
| destination | String: /^[A-Za-z0-9 ]+$/ | The flight's destination (city name) |
| originCode | String: /^[A-Z]{3}$/ | The flight's origin (IATA code) |
| destinationCode | String: /^[A-Z]{3}$/ | The flight's destination (IATA code) |
| flightNum | String: /^[A-Za-z0-9 ]+$/ | The flight number |

Please note that all items in the request are optional. If they are not provided, the previous data is kept.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and correctly updated the flight as prescribed |
| 400 | Something in the body is not in the correct format |
| 403 | There is no token provided, or it is invalid (could be expired) |
| 500 | We couldn't find the flight database - server messed up |

## /authenticate POST

This is the way to get a token from a password

```js
// request
let body = {
    "password": "hello"
}
let request = await fetchData("/authenticate", "post", body)

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "token": "6242511b9ca4b3e32f88054026e80be44c6c7709b322da5e84b205e7fbc465c2",
    "expiry": 1734775112,
    "level": "crew",
    "approval": true
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| password | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The password you want to provide |

This API will give an object in its response on success, with the object containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| token | String: /^[a-f0-9]{64}$/ | The approved token, which is what {{token}} is |
| expiry | Integer: integer > 0 | The unix time (seconds from 01/JNR/1970 00:00 UTC+0) in which the token expires. By default, this is an hour from when the server processed the request |
| level | String: "crew" or "admin" | The level of authorisation |
| approval | Boolean | Whether or not this token is allowed |

Note that, if the password is false, `approval` is set to `false` and nothing else is given.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have given you our verdict |
| 400 | The password is missing or in the incorrect format |
| 500 | We couldn't find the password database - server messed up |

## /authenticate/change POST

> This API is restricted to those with a valid admin token

This is the way to change the password for crew or admin (each can be changed only in separate transactions).

```js
// request
let body = {
    "password": "HelloThere!",
    "mode": "crew"
}
const headers = {
    "Cookie":"token={{token}}"
}
let request = await fetchData("/authenticate/change", "post", body, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "message":"Success!"
}
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| password | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The password you want to change to |
| mode | String: "crew" or "admin" | The group whose password you want to change |


Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have changed the password successfully |
| 400 | The password is missing or in the incorrect format, and/or the mode is missing or isn't "crew" or "admin" |
| 403 | There is no token, or it is not a current valid token for an admin |
| 500 | We couldn't find the password database - server messed up |

## /authenticate/token POST

This is the way to see a token's entitlements. This will only look for tokens in the `Cookie` header.

```js
// request
let headers = {
    "Cookie": "token={{token}}"
}
let request = await fetchData("/authenticate/token", "post", null, headers)

// response
console.log(request.body)
```

Expected response on success:

```json
{
    "token": "6242511b9ca4b3e32f88054026e80be44c6c7709b322da5e84b205e7fbc465c2",
    "expiry": 1734775112,
    "level": "crew",
    "approval": true
}
```

This API will give an object in its response on success, with the object containing the following:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| token | String: /^[a-f0-9]{64}$/ | The approved token, which is what {{token}} is |
| expiry | Integer: integer > 0 | The unix time (seconds from 01/JNR/1970 00:00 UTC+0) in which the token expires. By default, this is an hour from when the server processed the request |
| level | String: "crew" or "admin" | The level of authorisation |
| approval | Boolean | Whether or not this token is allowed |

Note that, if the password is false, `approval` is set to `false` and nothing else is given.

Types of responses:
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and have given you our verdict |
| 400 | The token is missing from the cookies, or in the incorrect format |