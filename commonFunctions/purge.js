// function to check all files and purge if video does not exist
const fs = require("fs")
const { readDb, writeDb } = require("../commonFunctions/database");

// to purge
async function purgeIrrelevance() {
    // checks whether to purge the films
    const films = fs.readdirSync("./assets/metadata")
    for(var i = 0; i < films.length; i++){
        let filmId = films[i].split(".")[0];
        await checkFilm(filmId)
    }

    // purges all messages
    await writeDb("main","messages",[])
}

// function to check a film
async function checkFilm(id){
    if(fs.existsSync(`./assets/thumbnails/${id}.jpg`) && fs.existsSync(`./assets/videos/${id}.mp4`)){
        // there exists video and thumbnail
        return;
    } else {
        await deleteFilmRecord(id);
    }
}

// deletes the film
async function deleteFilmRecord(id){
    if(Number.isInteger(id) == false){
        id = parseInt(id);
    }
    if(isNaN(id)){
        return;
    }

    // index reammendment
    let newIndex = [];
    let currIndex = await readDb("main","index");
    for(var i = 0; i < currIndex.length; i++){
        let q = currIndex[i];
        if(q.id != id){
            newIndex.push(q);
        }
    }
    await writeDb("main","index",newIndex)

    // metadata deletion
    if(fs.existsSync(`./assets/metadata/${id}.json`)){
        fs.unlinkSync(`./assets/metadata/${id}.json`)
    }

    // reviews deletion
    if(fs.existsSync(`./assets/reviews/${id}.json`)){
        fs.unlinkSync(`./assets/reviews/${id}.json`)
    }

    // thumbnail deletion
    if(fs.existsSync(`./assets/thumbnails/${id}.jpg`)){
        fs.unlinkSync(`./assets/thumbnails/${id}.jpg`)
    }

    // video deletion
    if(fs.existsSync(`./assets/videos/${id}.mp4`)){
        fs.unlinkSync(`./assets/videos/${id}.mp4`)
    }

    return;
}

module.exports = {purgeIrrelevance, deleteFilmRecord}