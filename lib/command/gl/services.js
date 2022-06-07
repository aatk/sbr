const fs = require("fs");

envToObject = (dotENVContent) => {
    let params = {};
    let regExp = /(?<param>[\w]+)=(?<value>[\s\S]*)/m;
    let envLines = dotENVContent.split("\n");
    envLines.map(line=>{
        let dataENVLine = regExp.exec(line);
        if (dataENVLine) {
            let append = {};
            append[dataENVLine.groups.param] = dataENVLine.groups.value;
            params = Object.assign(params, append);
        }
    })
    return params;
}

objectToEnv = (dotObject) => {
    let dotENVLines = [];
    for (let param in dotObject) {
        let value = dotObject[param];
        dotENVLines.push(`${param}=${value}`);
    }
    let dotENVContent = dotENVLines.join("\n");
    return dotENVContent;
}

getDotEnv = () => {
    let sbrPath = process.sbr.nowPath;
    let dotENVContent = '';
    if (fs.existsSync(sbrPath+"/.env")) {
        dotENVContent = fs.readFileSync(sbrPath+"/.env").toString();
    }
    return dotENVContent;
}

setDotEnv = (dotENVContent) => {
    let sbrPath = process.sbr.nowPath;
    fs.writeFileSync(sbrPath+"/.env", dotENVContent);
}

module.exports = {getDotEnv, setDotEnv, objectToEnv, envToObject}
