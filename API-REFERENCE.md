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

## Extra Details on API
This will only apply to services which aren't in the "statics" section.
Please note that the code examples are exclusively in pseudocode. The following command example:
```js
await fetchData(endpoint,method,payload,reqHeaders)
```
will act as an API call, where the data is returned, and:
- `endpoint` is the HTTP endpoint
- `method` is the method used, either `get` for `GET`, or `post` for `POST`
- `payload` which may be blank, but is a JSON with the request
- `reqHeaders` which may be blank, but is any different request headers. This is a JSON with the key being the header name, and value being its content.

This can be adapted to whatever is used in your programming language to make requests, e.g. axios.

The expectation is that the payload to POST requests are only in application/json (or are left blank), and any information for GET requests are given as a querystring.

Please note that `{{token}}` will refer to a token, either given by the server, or something which is provided back to the server, usually via the Cookie header. By default, tokens expire 60 minutes after issue.

## /message/fetch GET

This is a blanket request to get all messages. This method has been used in the design of the main app for checking if there is a connection with the server as well as getting any new messages.

```js
// request
let request = await fetchData("/message/fetch", "get")

// expected response (success)
console.log(request)
/* Expected response (sample data):
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
*/
```

This API will only give the messages from the last 30 seconds, and it is an array of JSONs, where:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| message | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The actual message body |
| timestamp | Integer: integer > 0 | The unix timestamp the server recieved the message (seconds from 01/JNR/1970 00:00 UTC+0) |

Types of responses
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We found the messages |
| 500 | We couldn't find the messages - server messed up |

## message/send POST
This is the way to send a message as a member of staff to be viewed in message fetches.
```js
// request
let body = {
    "message":"Testing 1 2 3"
}
let headers = {
    "Cookie":"{{token}}"
}
let request = await fetchData("/message/send", "post", body, headers)

// expected response
console.log(request)
/* Expected response (sample data):
[
    {
        "message":"Success!"
    }
]
*/
```

This API will only accept the cases where, for the body:
| Key | Expected Value Type & Format / Regex | Description |
| --- | --- | --- |
| message | String: /^[A-Za-z0-9 \.,\-!?'"()]+$/ | The actual message body |

Types of responses
| HTTP Status Code | Description | 
| --- | --- |
| 200 | We recieved your request, and correctly updated the message database as described |
| 400 | You did not provide a message, or it was not in the format as requested |
| 403 | There is no token provided, or it is invalid (could be expired) |