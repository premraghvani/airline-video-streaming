const express = require("express")
const app = express()
const fs = require("fs");
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// loads up a reference to all commands
const modules = fs.readdirSync("./commands").map(file => require(`./commands/${file}`))
let moduleList = Object.keys(modules);

// allocates different paths of API to different commands
for(var i = 0; i < moduleList.length; i++){
    let module = modules[moduleList[i]];
    app[module.method.toLowerCase()](module.page, module.execute);
}

// 404 page
app.get("*", function(req, res){
    res.status(404);
    if(req.accepts("html")){
        let errorPage = fs.readFileSync("./static/404.html").toString();

        let flightDetails = require("./assets/flightData.json")

        for(key in flightDetails){
            errorPage = errorPage.replaceAll(`{{${key}}}`,flightDetails[key])
        }

        res.set("Content-Type", "text/html");
        res.send(errorPage);
    } else {
        res.send(null)
    }
});


// export the app function
module.exports = {app}