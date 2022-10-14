const {getDotEnv, envToObject} = require("./gl/services");
const fs = require("fs");
const path = require("path");
const Zip = require("adm-zip");
const $api = require("./gl/api");

let dotENVParams = undefined;

installNewProject = async (projectName, data) => {
    //
    let thisPath = process.sbr.PWD;
    let installPath = path.join(thisPath, projectName);
    fs.mkdirSync(installPath, { recursive: true });
    
    // let packageJson = `${thisPath}/package.json`;
    // if (fs.existsSync(packageJson)) {
        let zipData = Buffer.from(data.data, "base64");
        let zip = new Zip(zipData);
        let name = data.manifest.name;
        console.log("install mis portal", name);
        
        fs.mkdirSync(installPath, { recursive: true });
        zip.extractAllTo(installPath, true);
        
        // await buildPackageJSON(thisPath, data, "nodecms");
        console.log(`Пакет расширения ${name} установлен в папку: `, installPath);
    // }
    // else {
    //     console.log("Error install, not exist package.json");
    // }
}

createNewProject = async (projectName) => {
    let packageName = "mis-portal-core"
    let version = '';
    if (packageName.indexOf("@") > 1) {
        let packageInfo = packageName.split("@");
        packageName = packageInfo[0];
        version = packageInfo[1];
    }
    
    try {
        let headers = JSON.parse(dotENVParams.HEADERS);
        let url = `${dotENVParams.STORE}/appstore/app/${packageName}/${version}`;
        console.log("url : ", url);
        let response = await $api.get(url, {headers: headers});
        let data = response.data;
        let manifest = JSON.parse(data.manifest);
        data.manifest = manifest;
        let type = manifest.typeSBR;
        
        //
        await installNewProject(projectName, data);
    }
    catch (e) {
        console.error(`Ошибка установки пакета "${packageName}": `, e.message)
    }
}

const main = async (options) => {
    let dotENVContent = getDotEnv();
    dotENVParams = envToObject(dotENVContent);
    
    console.log("create", process.sbr.argv);
    let projectName = process.sbr.argv[1];
    
    if (projectName) {
        await createNewProject(projectName);
    }
}

module.exports = main;