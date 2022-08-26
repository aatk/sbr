const {getDotEnv, envToObject} = require("./gl/services");
const axios = require("axios");
const Zip = require("adm-zip");
const fs = require("fs");
const path = require("path");

let dotENVParams = undefined;


installNodeCMS = async (data) => {
    //
    let thisPath = process.sbr.PWD;
    
    let packageJson = `${thisPath}/package.json`;
    if (fs.existsSync(packageJson)) {
        let zipData = Buffer.from(data.data, "base64");
        let zip = new Zip(zipData);
        let name = data.manifest.name;
        console.log("installNodeCMS", name);
    
        let installPath = `${thisPath}/ext_modules/${name}`;
        fs.mkdirSync(installPath, { recursive: true });
        zip.extractAllTo(installPath, true);
    
        await buildPackageJSON(thisPath, data, "nodecms");
        console.log(`Пакет расширения ${name} установлен в папку: `, installPath);
    }
    else {
        console.log("Error install, not exist package.json");
    }
}

installReactCMS = async (data) => {
    //
}

installNpm = async (data) => {
    let thisPath = process.sbr.PWD;
    
    let packageJson = `${thisPath}/package.json`;
    if (fs.existsSync(packageJson)) {
        let zipData = Buffer.from(data.data, "base64");
        let zip = new Zip(zipData);
        let name = data.manifest.name;
        console.log("install npm module: ", name);
        
        let installPath = `${thisPath}/node_modules/${name}`;
        fs.mkdirSync(installPath, { recursive: true });
        zip.extractAllTo( installPath, true);
        
        await buildPackageJSON(thisPath, data, "npm");
        console.log(`Пакет ${name} установлен в папку: `, installPath);
    }
    else {
        console.log("Error install, not exist package.json");
    }
}

installDep = async (thisPath, data) => {
    let manifest = data.manifest;
    let projectPackage = require(path.join(thisPath, "package.json"));
    projectPackage.dependencies = projectPackage.dependencies ? projectPackage.dependencies : {}
    projectPackage.dependenciesNodeCMS = projectPackage.dependenciesNodeCMS ? projectPackage.dependenciesNodeCMS : {}
    
    if (manifest.dependencies) {
        for (let name in manifest.dependencies) {
            if (Object.keys(projectPackage.dependencies).indexOf(name) === -1) {
                //Нет такого пакета в проекте - установим
                await install(name);
            }
        }
    }
    
    if (manifest.dependenciesNodeCMS) {
        for (let name in manifest.dependenciesNodeCMS) {
            if (Object.keys(projectPackage.dependenciesNodeCMS).indexOf(name) === -1) {
                //Нет такого пакета в проекте - установим
                await install(name);
            }
        }
    }
    
}

buildPackageJSON = async (thisPath, data, type) => {
    const packagePath = path.join(thisPath,'package.json');
    const fexist = fs.existsSync(packagePath);
    if (fexist) {
        let package = require(packagePath);
        if (type === "nodecms") {
            if (!package.dependenciesNodeCMS) {package.dependenciesNodeCMS = {}}
            package.dependenciesNodeCMS[data.manifest.name] = `^${data.manifest.version}`;
        }
        else if (type === "reactcms") {
            if (!package.dependenciesReactCMS) {package.dependenciesReactCMS = {}}
        }
        else {
            if (!package.dependencies) {package.dependencies = {}}
            package.dependencies[data.manifest.name] = `^${data.manifest.version}`;
        }
        fs.writeFileSync(packagePath, JSON.stringify(package, null, "    "));
        await installDep(thisPath, data);
    }
    else {
        console.error("buildPackageJSON: ", `Не найден файл ${packagePath}`)
    }
}




install = async (packageName) => {
    let version = '';
    if (packageName.indexOf("@") > 0) {
        let packageInfo = packageName.split("@");
        packageName = packageInfo[0];
        version = packageInfo[1];
    }
    
    try {
        let headers = JSON.parse(dotENVParams.HEADERS);
        let response = await axios.get(`${dotENVParams.STORE}/appstore/app/${packageName}/${version}`, {headers: headers});
        let data = response.data;
        let manifest = JSON.parse(data.manifest);
        data.manifest = manifest;
        let type = manifest.typeSBR;
        switch (type.toLowerCase()) {
            case 'nodecms':
                await installNodeCMS(data);
                break;
            case 'reactcms':
                await installReactCMS(data);
                break;
            default:
                await installNpm(data);
                break;
        }
    }
    catch (e) {
        console.error(`Ошибка установки пакета "${packageName}": `, e.message)
    }
}

module.exports = async () => {
    let dotENVContent = getDotEnv();
    dotENVParams = envToObject(dotENVContent);

    console.log("install", process.sbr.argv);
    let packageName = process.sbr.argv[1];

    await install(packageName);
}
