const {getDotEnv, envToObject} = require("./gl/services");
const axios = require("axios");
const Zip = require("adm-zip");
const fs = require("fs");
const path = require("path");

let dotENVParams = undefined;

updatePackageJSON = async () => {

}

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
        
        console.log(`Пакет ${name} установлен в папку: `, installPath);
        await buildPackageJSON(thisPath, data, "npm");
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
        let prefix = '^';
        if (type === "nodecms") {
            if (!package.dependenciesNodeCMS) {package.dependenciesNodeCMS = {}}
            if (package.dependenciesNodeCMS[data.manifest.name]) {
                //Такой пакет уже был установлен, возьмем оттуда префикс
                prefix = package.dependenciesNodeCMS[data.manifest.name][0] !== "^" ? '' : prefix;
            }
            package.dependenciesNodeCMS[data.manifest.name] = `${prefix}${data.manifest.version}`;
        }
        else if (type === "reactcms") {
            if (!package.dependenciesReactCMS) {package.dependenciesReactCMS = {}}
            if (package.dependenciesReactCMS[data.manifest.name]) {
                //Такой пакет уже был установлен, возьмем оттуда префикс
                prefix = package.dependenciesReactCMS[data.manifest.name][0] !== "^" ? '' : prefix;
            }
            package.dependenciesReactCMS[data.manifest.name] = `${prefix}${data.manifest.version}`;
        }
        else {
            if (!package.dependencies) {package.dependencies = {}}
            if (package.dependencies[data.manifest.name]) {
                //Такой пакет уже был установлен, возьмем оттуда префикс
                prefix = package.dependencies[data.manifest.name][0] !== "^" ? '' : prefix;
            }
            package.dependencies[data.manifest.name] = `${prefix}${data.manifest.version}`;
        }
        
        if (!dotENVParams.withOutUpdateProgectPackage) {
            fs.writeFileSync(packagePath, JSON.stringify(package, null, "    "));
        }
        
        dotENVParams.withOutUpdateProgectPackage = true; //Остальные пакеты не подгружаем в package.json
        await installDep(thisPath, data);
    }
    else {
        console.error("buildPackageJSON: ", `Не найден файл ${packagePath}`)
    }
}


installProject = async (PWD = undefined) => {
    let thisPath = PWD ? PWD : process.sbr.PWD;
    let projectPackagePath = path.join(thisPath, "package.json");
    if (fs.existsSync(projectPackagePath)) {

        let projectPackage = require(projectPackagePath);
        let npmModules = projectPackage.dependencies ? projectPackage.dependencies : {};
        let sberCMSModules = projectPackage.dependenciesNodeCMS ? projectPackage.dependenciesNodeCMS : {};
     
        for (let name in npmModules) {
            let version = npmModules[name];
            await install(`${name}@${version}`);
        }
    
        for (let name in sberCMSModules) {
            let version = sberCMSModules[name];
            await install(`${name}@${version}`);
        }
        console.log("Проект успешно собран!");
    }
    else {
        console.error("Ошибка: отсутствует файл ", projectPackagePath);
    }
}

install = async (packageName) => {
    console.log("packageName : ", packageName);
    
    try {
        let headers = JSON.parse(dotENVParams.HEADERS);
        let url = `${dotENVParams.STORE}/appstore/app/${packageName}`;
        console.log("url : ", url);
        let response = await axios.get(url, {headers: headers});
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
    console.log("dotENVParams", dotENVParams);

    console.log("install", process.sbr.argv);
    let packageName = process.sbr.argv[1];
    
    if (packageName) {
        dotENVParams.withOutUpdateProgectPackage = false;
        await install(packageName);
    } else {
        //Устанавливаем всё из пакета проекта
        dotENVParams.withOutUpdateProgectPackage = true;
        await installProject(undefined, dotENVParams)
    }
}
