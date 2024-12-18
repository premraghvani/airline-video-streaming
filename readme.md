# Airline Video Streaming

Some airlines, especially in Asia, now use a stream to your device system for in flight entertainment. This has inspired my project.

## Requirements

This app was made on node version `v20.16.0` with npm version `10.8.1`
To install, run `npm install`, and then `npm start` to start the server. It will run on port 80, so you can simply go to your browser and enter `http://localhost` to start the main app, or `http://localhost/crew` to see the crew/admin panel.

## Notes

The default passwords for the crew panel are:
- `hello` for crew abilities only
- `goodbye` for crew and admin abilities

## Acknowledgements

- Plyr (https://plyr.io/), for the video player
- ChatGPT (https://chatgpt.com/), for recommending Plyr, and acting as a second pair of eyes on code I have written
- Samuel Martins (https://blog.logrocket.com/build-video-streaming-server-node/), for suggestions on how to actually read the file, and highlighting the importance of the range header for videos
- Mozilla (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), for providing the HTTP status codes I have used
- Etihad Airways (https://strapi.wasmenia.com/uploads/Etihad_Airlines_Guideline_5a7d17b7d6.pdf), for the brand guidelines, which I have inspired this project on (I don't know the colour schemes which work best so I used theres)