const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");
const fs = require("fs");

// admins to delete the film(s)
module.exports = {
    page: "/film/individual/new/multimedia",
    method: "PUT",
    execute: async(req, res) => {
        const id = req.headers["x-request-id"];
        const content = req.headers["content-type"];
        const segmentRange = req.headers["content-range"];

        // input validation for headers
        if(!id || !content || !segmentRange){
            res.status(400).send({error:"Missing headers"});
            return;
        }
        if(/^[0-9]+$/.test(id) === false){
            res.status(400).send({error:"Invalid movie ID"});
            return;
        }
        if(["video/mp4","image/jpeg"].includes(content) === false){
            res.status(400).send({error:"Invalid content type"});
            return;
        }

        // range headers validation and checks
        const rangeMatch = segmentRange.match(/bytes (\d+)-(\d+)\/(\d+)/)
        if(!rangeMatch){
            res.status(400).send({error:"Invalid content range"});
            return;
        }

        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        const totalSize = parseInt(rangeMatch[3]);

        if(end >= totalSize){
            res.status(400).send({error:"Invalid content range - end can not exceed size"});
            return;
        }
        if(start > end){
            res.status(400).send({error:"Invalid content range - start can not be after end"});
            return;
        }

        // checks the chunk size
        let chunkSize = end - start + 1;
        if(chunkSize > 2* 10**6){
            res.status(400).send({error:"Invalid - the chunk exceeds 2MB (2,000,000 bytes)"});
            return;
        }

        // cross checks with body size
        let bodySize = req.body.length;
        if(bodySize != chunkSize){
            res.status(400).send({error:`Invalid - the chunk size implied in header (${chunkSize} B) does not match the size of the body (${bodySize} B)`});
            return;
        }

        // validation
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }

        // checks if movie already exists
        let movieMetadata = await readDb("metadata",id);
        if(movieMetadata === false){
            res.status(404).send({error:"Movie not found"});
            return;
        }

        // generates the path
        let path = "";
        if(content === "video/mp4"){
            path = `./assets/videos/${id}.mp4`
        } else {
            path = `./assets/thumbnails/${id}.jpg`
        }

        // checks if the content can be put
        if(movieMetadata.acceptingChange == undefined){
            res.status(400).send(JSON.stringify({error:"Can't upload data to this movie."}))
            return;
        } else if(content==="video/mp4" && movieMetadata.acceptingChange.video === false){
            res.status(400).send(JSON.stringify({error:"Can't upload data to this movie."}))
            return;
        } else if(content==="image/jpeg" && movieMetadata.acceptingChange.thumbnail === false){
            res.status(400).send(JSON.stringify({error:"Can't upload data to this movie."}))
            return;
        }

        // now, puts the content
        if(fs.existsSync(path) == false){
            fs.writeFileSync(path,"");
        }
        
        try {
            await writeToStreamAsync(path,req.body,{flags:"r+",start,end});

            // finishing: makes checks on if its the end
            if((end+1) == totalSize){
                // this indicates it is the last packet
                if(content === "video/mp4"){
                    movieMetadata.acceptingChange.video = false;
                } else {
                    movieMetadata.acceptingChange.thumbnail = false;
                }
                if(movieMetadata.acceptingChange.video == false && movieMetadata.acceptingChange.thumbnail == false){
                    movieMetadata.acceptingChange = undefined;
                }
                await writeDb("metadata",id,movieMetadata);
            }

            // conclusion
            res.status(200).json({ message: "Part uploaded successfully" });
            return;

        } catch(err){
            // errors
            res.status(500).json({ error: "File write error" });
            return;
        }
    }
};

// an async version to write the file (needed to be in async in this instance)
async function writeToStreamAsync(filePath, data, options = {}) {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath, options);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
        writeStream.end(data);
    });
}