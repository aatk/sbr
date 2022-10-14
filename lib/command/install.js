const {getDotEnv, envToObject} = require("./gl/services");
const Zip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const $api = require("./gl/api");

let dotENVParams = undefined;


class installPackage {
    parseIntVersion = (version) => {
        const intVersion = parseInt('1' + version
            .split(".")
            .map(value => {
                return parseInt(value)
            })
            .map(value => {
                let s = "000000000" + value;
                return s.substr(s.length - 5)
            })
            .join(''));
        return intVersion;
    }
    
    maxVersion = (version1, version2) => {
        let result = version2
        if (this.parseIntVersion(version1) > this.parseIntVersion(version2)) result = version1
        return result;
    }
    
}

class installNPM extends installPackage {
    
    packageData = {};
    
    constructor(packageData) {
        super();
        this.packageData = packageData;
    }
    
    main = async () => {
        let result = false;
        let thisPath = process.sbr.PWD;
        let packageJson = `${thisPath}/package.json`;
        if (fs.existsSync(packageJson)) {
            let zipData = Buffer.from(this.packageData.data, "base64");
            let zip = new Zip(zipData);
            let name = this.packageData.manifest.name;
            let version = this.packageData.manifest.version;
            let installPath = `${thisPath}/node_modules/${name}`;
            
            console.log("install npm module: ", name);
            
            try {
                const nowPackageManifestFile = path.join(thisPath, "node_modules", name, 'package.json');
                const nowPackageManifest = require(nowPackageManifestFile);
                console.log("versions ", nowPackageManifest.version, version);
                if ((nowPackageManifest.version !== version) && (version === this.maxVersion(nowPackageManifest.version, version))) {
                    result = true;
                }
            } catch (e) {
                result = true;
            }
            
            if (result) {
                fs.mkdirSync(installPath, {recursive: true});
                zip.extractAllTo(installPath, true);
                console.log(`Пакет ${name} установлен в папку: `, installPath);
            }
        }
        else {
            console.log("Error install, not exist package.json");
        }
        
        return result;
    }
}

class installNodeCMS extends installPackage {
    
    packageData = {};
    
    constructor(packageData) {
        super();
        this.packageData = packageData;
    }
    
    main = async () => {
        //
        let result = false;
        let thisPath = process.sbr.PWD;
        
        let packageJson = `${thisPath}/package.json`;
        if (fs.existsSync(packageJson)) {
            let zipData = Buffer.from(this.packageData.data, "base64");
            let zip = new Zip(zipData);
            let name = this.packageData.manifest.name;
            let version = this.packageData.manifest.version;
            let installPath = `${thisPath}/ext_modules/${name}`;
            
            console.log("installNodeCMS", `${name}@${version}`);
            
            try {
                const nowPackageManifestFile = path.join(thisPath, "ext_modules", name, 'package.json');
                const nowPackageManifest = require(nowPackageManifestFile);
                console.log("versions ", nowPackageManifest.version, version);
                if ((nowPackageManifest.version !== version) && (version === this.maxVersion(nowPackageManifest.version, version))) {
                    result = true;
                }
            } catch (e) {
                result = true;
            }
            
            if (result) {
                fs.mkdirSync(installPath, {recursive: true});
                zip.extractAllTo(installPath, true);
                console.log(`Пакет расширения ${name}@${version} установлен в папку: `, installPath);
            }
            
        }
        else {
            console.log("Error install, not exist package.json");
        }
        
        return result;
    }
    
}

class installReactCMS extends installPackage {
    packageData = {};
    
    constructor(packageData) {
        super();
        this.packageData = packageData;
    }
    
    main = async () => {
        //
    }
}


class install {
    
    dotENVParams = {};
    
    constructor() {
        let dotENVContent = getDotEnv();
        this.dotENVParams = envToObject(dotENVContent);
    }
    
    buildPackageJSON = async (thisPath, data, type, params = undefined) => {
        let dotENVParams = params ? params : {...this.dotENVParams};
        
        const packagePath = path.join(thisPath, 'package.json');
        const fexist = fs.existsSync(packagePath);
        if (fexist) {
            let packageJson = require(packagePath);
            let prefix = '^';
            if (type === "nodecms") {
                if (!packageJson.dependenciesNodeCMS) {
                    packageJson.dependenciesNodeCMS = {}
                }
                if (packageJson.dependenciesNodeCMS[data.manifest.name]) {
                    //Такой пакет уже был установлен, возьмем оттуда префикс
                    prefix = packageJson.dependenciesNodeCMS[data.manifest.name][0] !== "^" ? '' : prefix;
                }
                packageJson.dependenciesNodeCMS[data.manifest.name] = `${prefix}${data.manifest.version}`;
            }
            else if (type === "reactcms") {
                if (!packageJson.dependenciesReactCMS) {
                    packageJson.dependenciesReactCMS = {}
                }
                if (packageJson.dependenciesReactCMS[data.manifest.name]) {
                    //Такой пакет уже был установлен, возьмем оттуда префикс
                    prefix = packageJson.dependenciesReactCMS[data.manifest.name][0] !== "^" ? '' : prefix;
                }
                packageJson.dependenciesReactCMS[data.manifest.name] = `${prefix}${data.manifest.version}`;
            }
            else {
                if (!packageJson.dependencies) {
                    packageJson.dependencies = {}
                }
                if (packageJson.dependencies[data.manifest.name]) {
                    //Такой пакет уже был установлен, возьмем оттуда префикс
                    prefix = packageJson.dependencies[data.manifest.name][0] !== "^" ? '' : prefix;
                }
                packageJson.dependencies[data.manifest.name] = `${prefix}${data.manifest.version}`;
            }
            
            if (!dotENVParams.withOutUpdateProgectPackage) {
                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, "    "));
            }
            
            await this.installDependencies(thisPath, data, dotENVParams);
        }
        else {
            console.error("buildPackageJSON: ", `Не найден файл ${packagePath}`)
        }
    }
    
    installDependencies = async (thisPath, data, params) => {
        let PWD = process.sbr.PWD;
        let dotENVParams = params ? params : this.dotENVParams;
        dotENVParams.withOutUpdateProgectPackage = true; //Остальные пакеты не подгружаем в package.json
        
        let manifest = data.manifest;
        let projectPackage = require(path.join(thisPath, "package.json"));
        projectPackage.dependencies = projectPackage.dependencies ? projectPackage.dependencies : {}
        projectPackage.dependenciesNodeCMS = projectPackage.dependenciesNodeCMS ? projectPackage.dependenciesNodeCMS : {}
        
        if (manifest.dependencies) {
            for (let name in manifest.dependencies) {
                if (Object.keys(projectPackage.dependencies).indexOf(name) === -1) {
                    //Нет такого пакета в проекте - установим
                    await this.install(PWD, name, dotENVParams);
                }
            }
        }
        
        if (manifest.dependenciesNodeCMS) {
            for (let name in manifest.dependenciesNodeCMS) {
                if (Object.keys(projectPackage.dependenciesNodeCMS).indexOf(name) === -1) {
                    //Нет такого пакета в проекте - установим
                    await this.install(PWD, name, dotENVParams);
                }
            }
        }
        
    }
    
    installProject = async (PWD = undefined, params) => {
        // this.dotENVParams.withOutUpdateProgectPackage = true;
        
        let thisPath = PWD ? PWD : process.sbr.PWD;
        let projectPackagePath = path.join(thisPath, "package.json");
        if (fs.existsSync(projectPackagePath)) {
            
            let projectPackage = require(projectPackagePath);
            let npmModules = projectPackage.dependencies ? projectPackage.dependencies : {};
            let devNpmModules = projectPackage.devDependencies ? projectPackage.devDependencies : {};
            let sberCMSModules = projectPackage.dependenciesNodeCMS ? projectPackage.dependenciesNodeCMS : {};
            
            for (let name in npmModules) {
                let version = npmModules[name];
                await this.install(PWD, `${name}@${version}`);
            }
            
            for (let name in devNpmModules) {
                let version = devNpmModules[name];
                await this.install(PWD, `${name}@${version}`);
            }
            
            for (let name in sberCMSModules) {
                let version = sberCMSModules[name];
                await this.install(PWD, `${name}@${version}`);
            }
            
            console.log("Проект успешно собран!");
        }
        else {
            console.error("Ошибка: отсутствует файл ", projectPackagePath);
        }
    }
    
    install = async (PWD, packageName, params = undefined) => {
        console.log("packageName : ", packageName);
        let dotENVParams = params ? params : this.dotENVParams;
        
        try {
            let headers = {}
            if (this.dotENVParams.HEADERS) headers = JSON.parse(this.dotENVParams.HEADERS);
            let url = `${this.dotENVParams.STORE}/appstore/app/${packageName}`;
            console.log("url : ", url);
            
            let response = await $api.get(url, {headers: headers});
            let data = response.data;
            let manifest = JSON.parse(data.manifest);
            data.manifest = manifest;
            let type = manifest.typeSBR;
            
            let res;
            switch (type.toLowerCase()) {
                case 'nodecms':
                    type = "nodecms";
                    res = await (new installNodeCMS(data)).main();
                    break;
                case 'reactcms':
                    type = "reactcms";
                    res = await (new installReactCMS(data)).main();
                    break;
                default:
                    type = "npm";
                    res = await (new installNPM(data)).main();
                    break;
            }
            
            if (res) {
                await this.buildPackageJSON(PWD, data, type, dotENVParams);
            }
            
        } catch (e) {
            console.error(`Ошибка установки пакета "${packageName}": `, e.message)
        }
    }
    
    main = async (args) => {
        console.log("install", args); //process.sbr.argv
        let PWD = process.sbr.PWD;
        
        let packageName = args[1];
        
        if (packageName) {
            this.dotENVParams.withOutUpdateProgectPackage = false;
            await this.install(PWD, packageName);
        }
        else {
            //Устанавливаем всё из пакета проекта
            await this.installProject(PWD, this.dotENVParams)
        }
    }
}


module.exports = install
