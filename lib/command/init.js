const fs = require("fs");
// const readlinePromises = require('node:readline/promises');
const {readlinePromises} = require('readline');
const readline = require("readline");

let stepsTree = {
    main: {
        question: "Do you want to create an Node CMP (n) / React CMP (r) / NPM (s) module for MIS CRM: ",
        answer: {
            "n": {next: "ext2"},
            "r": {next: "ext2"},
            "s": {next: 1}
        }
    },
    ext2: {
        question: "Do you want to create all skeleton (yes): ",
        answer: {
            "": {next: 1},
            "y": {next: 1},
            "n": {next: 1}
        }
    },
    1: {
        preQuestion: (q) => {
            let name = process.sbr.PWD.split("/").pop();
            name = q.replace("$1", name);
            return name;
        },
        question: "package name: ($1): ",
        next: 2
    },
    2: {
        question: "version: (1.0.0): ",
        next: 3
    },
    3: {
        question: "description: ",
        next: 4
    },
    4: {
        question: "entry point: (index.js): ",
        next: 5
    },
    5: {
        question: "test command: ",
        next: 6
    },
    6: {
        question: "git repository: ",
        next: 7
    },
    7: {
        question: "keywords: ",
        next: 8
    },
    8: {
        question: "author: ",
        next: 9
    },
    9: {
        question: "license: (ISC): ",
        next: 10
    },
    10: {
        question: "Is this OK? (yes): ",
        answer: {
            "": {},
            "y": {},
            "n": {}
        }
    },
}

function ask(rl, question) {
    return new Promise(resolve => {
        rl.question(question, input => resolve(input));
    });
}

let stepByStep = async (rl, stepName, answerObject) => {
    let nextStepName = undefined;
    let question = stepsTree[stepName];

    let questionText = question.question;
    if (question.preQuestion) {
        questionText = question.preQuestion(questionText);
    }
    
    let answer = await ask(rl,questionText);
    // let answer = await rl.question(questionText);
    if (question.answer) {
        //Есть варианты ответов
        if (question.answer[answer.toLowerCase()]) {
            //Ответ подходит
            let answerRead = question.answer[answer.toLowerCase()];
            answerObject[stepName] = answer;
            nextStepName = answerRead["next"];
        } else {
            console.log("I don't know the answer, please try again");
        }
    } else {
        answerObject[stepName] = answer;
        nextStepName = question["next"];
    }

    if (nextStepName) {
        await stepByStep(rl, nextStepName, answerObject);
    }
}

let getGitRepository = async (params) => {

}

let buildNpmPackage = async (params) => {

    let tmpName = process.sbr.PWD.split("/").pop();
    let objectNpmJson = {
        "name": params["1"] === "" ? tmpName : params["1"],
        "version": params["2"] === "" ? "1.0.0" : params["2"],
        "description": params["3"],
        "main": params["4"] === "" ? "index.js" : params["4"],
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1",
        },
        "repository": {
            "type": "git",
            "url": "git+" + params["5"]
        },
        "keywords": params["6"] === "" ? [] : params["6"].split(" "),
        "author": params["7"],
        "license": params["8"] === "" ? "ISC" : params["8"],
        "bugs": {
            "url": ""
        },
        "homepage": "",
        "dependencies": {}
    }

    fs.writeFileSync("package.json", JSON.stringify(objectNpmJson, null, "    "));
}

let buildNodeCMSPackage = async (params) => {

    let tmpName = process.sbr.PWD.split("/").pop();
    tmpName = params["1"] === "" ? tmpName : params["1"]
    tmpName = tmpName.toLowerCase();

    let routeName = '';
    let shortName = tmpName;
    let indexM = 0;
    let shortNameFree = shortName;
    while (indexM !== -1) {
        indexM = shortNameFree.indexOf("-");
        if (indexM !== -1) {
            shortNameFree = shortNameFree.slice(0,indexM) + shortNameFree.charAt(indexM+1).toUpperCase() + shortNameFree.slice(indexM+2);
        }
    }
    
    
    let routes = {};
    if (params.ext2 === "y") {
        // if (tmpName.slice(-3) === "cmp") {
        //     shortName = tmpName.slice(0, tmpName.length-3);
        // }
        // routeName = shortName;
        // shortName = shortName.slice(0,1).toUpperCase() + shortName.slice(1);
        routes[`/${shortNameFree.toLowerCase()}`] = {
            router : `${shortNameFree}.router.js`
        }
    }

    let objectNpmJson = {
        "name": tmpName,
        "version": params["2"] === "" ? "1.0.0" : params["2"],
        "typeSBR": "NodeCMS",
        "enabled" : true,
        "description": params["3"],
        "main": params["4"] === "" ? "index.js" : params["4"],
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1",
        },
        "repository": {
            "type": "git",
            "url": "git+" + params["5"]
        },
        "keywords": params["6"] === "" ? [] : params["6"].split(" "),
        "author": params["7"],
        "license": params["8"] === "" ? "ISC" : params["8"],
        "bugs": {
            "url": ""
        },
        "homepage": "",
        "dependencies": {},
        "dependenciesNodeCMS": {},
        "dependenciesReactCMS": {},
        "extensions" : {},
        "routes": routes
    }

    fs.writeFileSync("package.json", JSON.stringify(objectNpmJson, null, "    "));

    if (params.ext2 === "y") {
        let defaultPath = [
            "services/models",
            "routers",
            "controllers",
            "db/dtos",
            "db/migrations",
            "db/models",
            "db/seeders",
        ]
        defaultPath.map(path => {
            fs.mkdirSync(process.sbr.PWD+'/'+path, { recursive: true })
        });

        let nowDate = Date.now();
        let defaultFiles = [
            {name: `routers/${shortNameFree}.router.js`, template: "routers/TMP.router.js.tmp"},
            {name: `services/${shortNameFree}.service.js`, template: "services/TMP.service.js.tmp"},
            {name: `services/models/${shortNameFree}.model.js`, template: "services/models/TMP.model.js.tmp"},
            {name: `controllers/${shortNameFree}.controller.js`, template: "controllers/TMP.controller.js.tmp"},

            {name: `db/dtos/${shortNameFree}.dto.js`, template: "db/dtos/TMP.dto.js.tmp"},
            {name: `db/migrations/${nowDate}-create-${shortNameFree}.js`, template: "db/migrations/date-create-TMP.js.tmp"},
            {name: `db/models/${shortNameFree}.js`, template: "db/models/TMP.js.tmp"},
            {name: `db/seeders/${nowDate}-${shortNameFree}.js`, template: "db/seeders/date-TMP.js.tmp"}
        ]
        
        defaultFiles.map(file=>{
            let template = '';
            if (file.template) {
                template = fs.readFileSync(process.sbr.nowPath+'/template/cms.node/'+file.template).toString();
                template = template.replaceAll("{{shortName}}", shortNameFree);
            }
            fs.writeFileSync(process.sbr.PWD+'/'+file.name, template);
        });
    }

}

let buildReactCMSPackage = async (params) => {

    let tmpName = process.sbr.PWD.split("/").pop();
    tmpName = params["1"] === "" ? tmpName : params["1"]
    tmpName = tmpName.toLowerCase();

    let routeName = '';
    let shortName = tmpName;
    let routes = {};
    if (params.ext2 === "y") {
        if (tmpName.slice(-3) === "cmp") {
            shortName = tmpName.slice(0, tmpName.length-3);
        }
        routeName = shortName;
        shortName = shortName.slice(0,1).toUpperCase() + shortName.slice(1);
    }

    let objectNpmJson = {
        "name": tmpName,
        "version": params["2"] === "" ? "1.0.0" : params["2"],
        "type": "ReactCMS",
        "enabled" : true,
        "description": params["3"],
        "main": params["4"] === "" ? "index.js" : params["4"],
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1",
        },
        "repository": {
            "type": "git",
            "url": "git+" + params["5"]
        },
        "keywords": params["6"] === "" ? [] : params["6"].split(" "),
        "author": params["7"],
        "license": params["8"] === "" ? "ISC" : params["8"],
        "bugs": {
            "url": ""
        },
        "homepage": "",
        "dependencies": {},
        "dependenciesNodeCMS": {},
        "dependenciesReactCMS": {},
        "extensions" : {}
    }

    fs.writeFileSync("package.json", JSON.stringify(objectNpmJson, null, "    "));

    if (params.ext2 === "y") {

        let defaultFiles = [
            {name: `index.js`, template: "index.js.tmp"},
        ]
        defaultFiles.map(file=>{
            let template = '';
            if (file.template) {
                template = fs.readFileSync(process.sbr.nowPath+'/template/cms.react/'+file.template).toString();
                template = template.replaceAll("{{shortName}}", shortName);
            }
            fs.writeFileSync(process.sbr.PWD+'/'+file.name, template);
        });
    }

}

module.exports = async () => {
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // const rl = readlinePromises.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    let answerObject = {};
    if ((process.sbr.argv[1]) && (process.sbr.argv[1] === "-y")) {
        let main = "s";
        if (process.sbr.argv[2]) {
            if (process.sbr.argv[2] === "-r") {
                main = "r";
            }
            if (process.sbr.argv[2] === "-n") {
                main = "n";
            }
        }

        answerObject = {
            '1': '',
            '2': '',
            '3': '',
            '4': '',
            '5': '',
            '6': '',
            '7': '',
            '8': '',
            '9': '',
            '10': '',
            main: main,
            ext2: 'y'
        }
    } else {
        let stepName = "main";
        await stepByStep(rl, stepName, answerObject);
    }

    // console.log(answerObject);

    switch (answerObject.main) {
        case "n":
            await buildNodeCMSPackage(answerObject);
            break;
        case "r":
            await buildReactCMSPackage(answerObject);
            break;
        case "s":
            await buildNpmPackage(answerObject);
            break;
    }

    await rl.close();
}
