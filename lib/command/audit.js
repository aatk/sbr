const path = require("path");
const fs = require("fs");

// const dirs = [
//     "analytics",
//     "appstore",
//     "backend",
//     "esb",
//     "exservices",
//     "filemanager",
//     // "frontend",
//     "notification",
//     "worker"
// ]

objects = {}

const getAllFiles = (dir, findExt) => {
    let allFiles = {};
    let objects = fs.readdirSync(dir);
    objects.map(fileOrDir => {
        let name = `${dir}/${fileOrDir}`;
        let fileStat = fs.statSync(name)
        if (fileStat.isDirectory()) {
            let innerFiles = getAllFiles(name, findExt);
            allFiles = {...allFiles, ...innerFiles};
        } else {
            if (path.extname(name) === findExt) {
                allFiles[name] = {}
            }
        }
    })
    return allFiles;
}

const getAllDependencies = (fileJsPath, modulePath) => {
    //Получить все зависимости
    const regex = /require\(['|"|`](?<pathRequire>.+)['|"|`]\)/gm;
    regex.lastIndex=0;
    
    let dirname = path.dirname(fileJsPath);
    let contentJsFile = fs.readFileSync(fileJsPath, "utf8");
    
    let requireInner = [];
    let m;
    do {
        m = regex.exec(contentJsFile);
        if (m) requireInner.push(m.groups.pathRequire);
    } while (m);
    
    let npmModules = [];
    let NodeCMSModules = [];
    
    requireInner.map(requireFile => {
        if (requireFile.slice(0,1) === ".") {
            //Это относительный путь
            let requireFilePath = path.join(dirname, requireFile);
            if (requireFilePath.indexOf(modulePath) >= 0) {
                requireFilePath = requireFilePath.replace(modulePath, '');
                let pathSplitter = requireFilePath.split("/");
                let moduleName = pathSplitter[1];
                if (NodeCMSModules.indexOf(moduleName) === -1) {
                    NodeCMSModules.push(moduleName);
                }
            }
        } else {
            //Это npm модуль
            npmModules.push(requireFile);
        }
    })
    
    return { dependencies: npmModules, dependenciesNodeCMS: NodeCMSModules };
}

const getAllNodeCMSPackages = (fullPath) => {
    let extModules = {}
    let extModulesPath = `${fullPath}/ext_modules`;
    if (fs.existsSync(extModulesPath)) {
        //Просмотрим все вложенные пакеты
        let modules = fs.readdirSync(extModulesPath);
        console.log("Modules", modules);
        modules.map(module => {
            let modulesPackageFile = `${extModulesPath}/${module}/package.json`
            if (fs.existsSync(modulesPackageFile)) {
                let package = require(modulesPackageFile);
                package.typeSBR = "NodeCMS";
                extModules[module] = {
                    pathname: `${extModulesPath}/${module}`,
                    package: package
                }
            }
        })
    }
    
    return extModules;
}


const getDependenciesNodeCMSFormat = (nodeCMSModules) => {
    let dependenciesNodeCMS = {};
    Object.keys(nodeCMSModules).map(name => {
        dependenciesNodeCMS[name] = nodeCMSModules[name].package.version ? '^'+nodeCMSModules[name].package.version : "^1.0.0";
    });
    return dependenciesNodeCMS;
}

const updateNodeCMSModules = (serverObject) => {
    let projectPackage = serverObject.package;
    
    let nodeCMSModules = serverObject.nodeCMSModules;
    for (let nodeCMSName in nodeCMSModules) {
        let nodeCMSModule = nodeCMSModules[nodeCMSName];
        
        let dependencies = {};
        nodeCMSModule.dependencies.map(dependencie => {
            let devDependencies = projectPackage.devDependencies ? projectPackage.devDependencies : {}
            let npmDependencie = projectPackage.dependencies[dependencie] ? projectPackage.dependencies[dependencie] : devDependencies[dependencie]
            if (npmDependencie) {
                dependencies[dependencie] = npmDependencie;
            }
        })
        nodeCMSModule.package.dependencies = dependencies;
        
        let dependenciesNodeCMS = {};
        nodeCMSModule.dependenciesNodeCMS.map(dependencie => {
            dependenciesNodeCMS[dependencie] = projectPackage.dependenciesNodeCMS[dependencie] ? projectPackage.dependenciesNodeCMS[dependencie] : "^0.0.0";
        })
        nodeCMSModule.package.dependenciesNodeCMS = dependenciesNodeCMS;
        
        nodeCMSModules[nodeCMSName] = nodeCMSModule;
    }
    
    return nodeCMSModules;
}

const saveNodeCMSModules = (nodeCMSModules) => {
    for (let moduleName in nodeCMSModules) {
        let moduleInfo = nodeCMSModules[moduleName];
        
        let packageFile = `${moduleInfo.pathname}/package.json`;
        fs.writeFileSync(packageFile, JSON.stringify(moduleInfo.package, null, "    "));
    }
}

const readAllNodeCMSPackage = (fullPath, dir) => {
    console.log(fullPath)
    let packageFile = `${fullPath}/package.json`
    if (fs.existsSync(packageFile)) {
        //Это nodejs проект
        let package = require(packageFile);
        let objects = {};
        objects[dir] = {
            package: package
        }
        
        let nodeCMSModules = getAllNodeCMSPackages(fullPath);
        // console.log(nodeCMSModules);
        
        for (let module in nodeCMSModules) {
            let moduleInfo = nodeCMSModules[module];
            nodeCMSModules[module].jsFiles = getAllFiles(moduleInfo.pathname, ".js");
        }
        
        for (let module in nodeCMSModules) {
            let moduleInfo = nodeCMSModules[module];
            moduleInfo.dependencies = {};
            moduleInfo.dependenciesNodeCMS = {};
            
            for (let filename in moduleInfo.jsFiles) {
                let fileInfo = moduleInfo.jsFiles[filename];
                let { dependencies, dependenciesNodeCMS} = getAllDependencies(filename, `${fullPath}/ext_modules`);
                fileInfo.dependencies = dependencies;
                fileInfo.dependenciesNodeCMS = dependenciesNodeCMS;
                
                for (let dependencie of dependencies) {
                    moduleInfo.dependencies[dependencie] = 0
                }
                for (let dependencie of dependenciesNodeCMS) {
                    if (dependencie !== module) {
                        moduleInfo.dependenciesNodeCMS[dependencie] = 0
                    }
                }
            }
            
            moduleInfo.dependencies = Object.keys(moduleInfo.dependencies);
            moduleInfo.dependenciesNodeCMS = Object.keys(moduleInfo.dependenciesNodeCMS);
            
            nodeCMSModules[module] = moduleInfo;
        }
        
        objects[dir].nodeCMSModules = nodeCMSModules;
        
        //Соберем правильно package.json'ы
        
        objects[dir].package.dependenciesNodeCMS = getDependenciesNodeCMSFormat(nodeCMSModules);
        nodeCMSModules = updateNodeCMSModules(objects[dir]);
        
        saveNodeCMSModules(nodeCMSModules);
        fs.writeFileSync(packageFile, JSON.stringify(objects[dir].package, null, "    "));
        // console.log(objects[dir]);
    }
}

module.exports = async () => {
    //
    let subCommand = process.sbr.argv[1];
    
    switch (subCommand) {
        case "fix": {
            let PWD = process.sbr.PWD;
            let project = process.sbr.PWD.toString().split("/").pop();
            readAllNodeCMSPackage(PWD, project)
            break
        }
    }
}
// dirs.map(dir => readAllNodeCMSPackage(path.join(process.env.PWD, `../${dir}`), dir))
