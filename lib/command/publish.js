const {getDotEnv, envToObject} = require("./gl/services");
const Zip = require("adm-zip");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

let dotENVParams = undefined;

objectToCookies = (objectCookies) => {
    let cookies = [];
    for (let name in objectCookies) {
        let value = objectCookies[name];
        cookies.push(`${name}=${value}`);
    }
    return cookies.join("; ");
}

upVersion = (version) => {
    let versions = version.split('.');
    versions[versions.length - 1] = parseInt(versions[versions.length - 1]) + 1;
    return versions.join(".");
}


publishAll = async (PWD) => {
    let projectPath = getProjectPath(PWD);
    let projectPackage = path.join(projectPath, 'package.json');
    if (fs.existsSync(projectPackage)) {
        let package = require(projectPackage);
        let dependencies = package.dependencies ? package.dependencies : {}
        let dependenciesNodeCMS = package.dependenciesNodeCMS ? package.dependenciesNodeCMS : {}
        let dependenciesReactCMS = package.dependenciesReactCMS ? package.dependenciesReactCMS : {}
    
        for (let name in dependencies) {
            let packagePath = path.join(PWD, 'node_modules', name);
            if (fs.existsSync(packagePath)) {
                // let params = dotENVParams;
                // params.withDep = true;
                await publishNpm(packagePath, dotENVParams);
                // await publishAny(packagePath, dotENVParams)
            }
        }

        for (let name in dependenciesNodeCMS) {
            let packagePath = path.join(PWD, 'ext_modules', name);
            if (fs.existsSync(packagePath)) {
                // let params = dotENVParams;
                // params.withDep = true;
                await publishSbrCMS(packagePath, dotENVParams)
                // await publishAny(packagePath, dotENVParams)
            }
        }
        
    }
    else {
        console.error("Ошибка файла 'package.json', не смог найти по пути: ", projectPackage);
    }
}

publishAny = async (pathModules, params) => {
    let pathArray = pathModules.split("/");

    if (pathArray[pathArray.length - 2] === "node_modules") {
        //publishNMP
        await publishNpm(pathModules, params)
    }
    else if (pathArray[pathArray.length - 2] === "ext_modules") {
        //publishSberCMS
        await publishSbrCMS(pathModules, params)
    }
}

publishSbrCMS = async (pathModules, params) => {
    
    let pathArray = pathModules.split("/");
    if (pathArray[pathArray.length - 2] === "ext_modules") {
        let PWD = pathModules;
        let packageCMP = require(PWD+'/package.json');
    
        if (params.autoVersion) {
            packageCMP.version = upVersion(packageCMP.version);
            fs.writeFileSync(PWD + '/package.json', JSON.stringify(packageCMP, null, '    '));
        }
        
        // let pathArray = PWD.split("/");
        let zipName = '';
    
        let zip = new Zip();
        zip.addLocalFolder(PWD, zipName, (name) => {return name[0] !== "."});
        let zipBuffer = zip.toBuffer();
        // console.log(zipBuffer);
    
        let form = new FormData();
        form.append("name", packageCMP.name);
        form.append("version", packageCMP.version);
        if (packageCMP.homepage) {
            form.append("homepage", packageCMP.homepage);
        }
        if (packageCMP.repository) {
            let data = packageCMP.repository;
            if (typeof packageCMP.repository === "object") {
                data = JSON.stringify(data, null, "    ");
            }
            form.append("repository", data);
        }
    
        form.append('upload', zipBuffer, "package.zip");
    
        let headers = JSON.parse(params.HEADERS);
        // console.log(headers);
        headers["Cookie"] = objectToCookies(JSON.parse(params.COOKIES));
        headers["Content-type"] = "multipart/form-data; boundary=" + form.getBoundary();
        // console.log(headers);
    
        try {
            let response = await axios.post(params.STORE+"/appstore/app", form, { headers: headers });
            console.log(`Пакет расширения ${packageCMP.name} успешно опубликован`);
    
            if (params.withDep) {
                await getAllDependencies(PWD, params);
            }
            
        } catch (e) {
            console.log(`Ошибка публикации пакета "${packageCMP.name}"`, e);
        }
        
    } else {
        console.error(`Ошибка публикации модуля "${pathModules}". Перейдите в папку с модулем ./[Папка модуля], и попробуйте запустить publish из этой папки`);
    }
}

publishNpm = async (pathModules, params) => {
    
    let pathArray = pathModules.split("/");
    if (pathArray[pathArray.length - 2] === "node_modules") {
        let packageJSONPath = path.join(pathModules, '/package.json');
        let packageCMP = require(packageJSONPath);
        
        if (params.autoVersion) {
            packageCMP.version = upVersion(packageCMP.version);
            fs.writeFileSync(packageJSONPath, JSON.stringify(packageCMP, null, '    '));
        }
        
        // let pathArray = PWD.split("/");
        let zipName = '';
        
        let zip = new Zip();
        zip.addLocalFolder(pathModules, zipName, (name) => {return name[0] !== "."});
        let zipBuffer = zip.toBuffer();
        // console.log(zipBuffer);
        
        let form = new FormData();
        form.append("name", packageCMP.name);
        form.append("version", packageCMP.version);
        if (packageCMP.homepage) {
            form.append("homepage", packageCMP.homepage);
        }
        if (packageCMP.repository) {
            let data = packageCMP.repository;
            if (typeof packageCMP.repository === "object") {
                data = JSON.stringify(data, null, "    ");
            }
            form.append("repository", data);
        }
        
        form.append('upload', zipBuffer, "package.zip");
        
        let headers = JSON.parse(params.HEADERS);
        // console.log(headers);
        headers["Cookie"] = objectToCookies(JSON.parse(params.COOKIES));
        headers["Content-type"] = "multipart/form-data; boundary=" + form.getBoundary();
        // console.log(headers);
        
        try {
            let response = await axios.post(params.STORE+"/appstore/app", form, { headers: headers });
            console.log(`Пакет ${packageCMP.name} опубликован`);
            
            if (params.withDep) {
                await getAllDependencies(pathModules, params);
            }
            
        } catch (e) {
            console.error(`Ошибка публикации пакета ${packageCMP.name}`, e);
        }
        
    } else {
        console.error(`Ошибка публикации модуля "${pathModules}". Перейдите в папку с модулем ./[Папка модуля], и попробуйте запустить publish из этой папки`);
    }
}


getProjectPath = (PWD) => {
    let PWDArray = PWD.split("/");
    let newPWD = [];
    for (let value of PWDArray) {
        if ((value === "ext_modules") || (value === "node_modules")) {
            break;
        } else {
            newPWD.push(value);
        }
    }
    return newPWD.join("/");
}

getNpmDependencies = async (PWD, npmModules, packageCMP, params) => {
    let projectPath = getProjectPath(PWD);
    for (let name in npmModules) {
        let modulePWD = path.join(projectPath,"node_modules", name);
        if (fs.existsSync(modulePWD)) {
            console.error(`Устанавливаем вложенный модуль ${name} пакета ${packageCMP.name}`)
            await publishNpm(modulePWD, params);
        } else {
            console.error(`Не найден node_module ${name} пакета ${packageCMP.name}`)
        }
    }
}

getSberCMSDependencies = async (PWD, sberCMSModules, packageCMP, params) => {
    let projectPath = getProjectPath(PWD);
    for (let name in sberCMSModules) {
        let modulePWD = path.join(projectPath,"ext_modules", name);
        if (fs.existsSync(modulePWD)) {
            await publishSbrCMS(modulePWD, params);
        } else {
            console.error(`Не найден ext_module ${name} пакета ${packageCMP.name}`)
        }
    }
}

getAllDependencies = async (PWD, params) => {
    let packageCMP = require(PWD+'/package.json');
    let npmModules = packageCMP.dependencies ? packageCMP.dependencies : {};
    let sberCMSModules = packageCMP.dependenciesNodeCMS ? packageCMP.dependenciesNodeCMS : {};
    
    await getNpmDependencies(PWD, npmModules, packageCMP, params);
    await getSberCMSDependencies(PWD, sberCMSModules, packageCMP, params);
}

module.exports = async (args) => {
    
    let dotENVContent = getDotEnv();
    dotENVParams = envToObject(dotENVContent);
    
    if (args.indexOf("-all") > -1 ) {
        //Публикуем все модули, желательно использовать только один раз !!!!
        dotENVParams.withDep = args.indexOf("-withDep") >= 0;
        await publishAll(process.sbr.PWD, dotENVParams);
    } else {
        dotENVParams.withDep = args.indexOf("-withDep") >= 0;
        dotENVParams.autoVersion = args.indexOf("-autoVersion") >= 0;
        await publishAny(process.sbr.PWD, dotENVParams)
    }

}
