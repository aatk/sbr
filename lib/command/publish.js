const {getDotEnv, envToObject} = require("./gl/services");
const Zip = require("adm-zip");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

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
    
        if (params.autoversion) {
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
            form.append("repository", packageCMP.repository);
        }
    
        form.append('upload', zipBuffer, "package.zip");
    
        let headers = JSON.parse(params.HEADERS);
        // console.log(headers);
        headers["Cookie"] = objectToCookies(JSON.parse(params.COOKIES));
        headers["Content-type"] = "multipart/form-data; boundary=" + form.getBoundary();
        // console.log(headers);
    
        try {
            let response = await axios.post(params.STORE+"/appstore/app", form, { headers: headers });
            console.log(response.data);
    
            if (params.withDep) {
                await getAllDependencies(PWD, params);
            }
            
        } catch (e) {
            console.log(e);
        }
        
    } else {
        console.error("Ошибка публикации модуля. Перейдите в папку с модулем ./[Папка модуля], и попробуйте запустить publish из этой папки");
    }
}

publishNpm = async (pathModules, params) => {
    
    let pathArray = pathModules.split("/");
    if (pathArray[pathArray.length - 2] === "node_modules") {
        let PWD = pathModules;
        let packageCMP = require(PWD+'/package.json');
        
        if (params.autoversion) {
            packageCMP.version = upVersion(packageCMP.version);
            fs.writeFileSync(PWD+'/package.json', JSON.stringify(packageCMP, null, '    '));
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
            form.append("repository", packageCMP.repository);
        }
        
        form.append('upload', zipBuffer, "package.zip");
        
        let headers = JSON.parse(params.HEADERS);
        // console.log(headers);
        headers["Cookie"] = objectToCookies(JSON.parse(params.COOKIES));
        headers["Content-type"] = "multipart/form-data; boundary=" + form.getBoundary();
        // console.log(headers);
        
        try {
            let response = await axios.post(params.STORE+"/appstore/app", form, { headers: headers });
            console.log(response.data);
            
            if (params.withDep) {
                await getAllDependencies(PWD, params);
            }
            
        } catch (e) {
            console.log(e);
        }
        
    } else {
        console.error("Ошибка публикации модуля. Перейдите в папку с модулем ./[Папка модуля], и попробуйте запустить publish из этой папки");
    }
}


getProjectPath = (PWD) => {
    let PWDArray = PWD.split("/");
    let newPWD = [];
    for (let value of PWDArray) {
        if (value === "ext_modules") {
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
    
    await getSberCMSDependencies(PWD, sberCMSModules, packageCMP, params);
    await getNpmDependencies(PWD, npmModules, packageCMP, params);
}

module.exports = async (args) => {

    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);
    
    if (args[1] === "all") {
        //Публикуем все модули, желательно использовать только один раз !!!!
        
    } else {
        params.withDep = args[1] === "withDep";
        await publishAny(process.sbr.PWD, params)
    }

}
