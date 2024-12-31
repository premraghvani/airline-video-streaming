# Airline Video Streaming

Some airlines, especially in Asia, now use a stream to your device system for in flight entertainment. This has inspired my project.

This project can be used on trains too, with similar services being used on UK train companies such as TransPennine Express in the past through their now discontinued service, "ExStream". [1]

## Requirements

This app was made on node version `v20.16.0` with npm version `10.8.1`
To install:
```bash
npm install
```

To start:
```bash
npm start
```

It will run on port 80, so you can simply go to your browser and enter:
- `http://localhost` to start the main app, or 
- `http://localhost/crew` to see the crew/admin panel.

If your port 80 is already being used, please change the port number in line 2 / `port` of `config.json` from `80` to whatever you desire, and please update the url to:
- `http://localhost:[PORT]`, or 
- `http://localhost:[PORT]/crew`
where `[PORT]` is the port number you have selected.

The server will not need to be connected to the global internet for this to work, as all CSS and JavaScript packages used have been downloaded and will be fulfilled by the server. It can be connected to an intranet with devices that will connect to it.

## Notes

The default passwords for the crew panel are:
- `hello` for crew abilities only
- `goodbye` for crew and admin abilities

These may be changed by you, using the relavant APIs.

## API Guidance

Please see `API-REFERENCE.md` (in the root directory, same as this file) for information.

## Acknowledgements

- Plyr (https://plyr.io/), for the video player
- ChatGPT (https://chatgpt.com/), for recommending Plyr, and acting as a second pair of eyes on code I have written
- Samuel Martins (https://blog.logrocket.com/build-video-streaming-server-node/), for suggestions on how to actually read the file, and highlighting the importance of the range header for videos
- Mozilla (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), for providing the HTTP status codes I have used
- Etihad Airways (https://strapi.wasmenia.com/uploads/Etihad_Airlines_Guideline_5a7d17b7d6.pdf), for the brand guidelines, which I have inspired this project on (I don't know the colour schemes which work best so I used theres)
- w3schools (https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal), for modal ideas
- Nodejs fs library (https://nodejs.org/api/fs.html), for help in how the write streams work

## Sources
[1] https://havasred.co.uk/portfolio/transpennine-express-hold-the-door/