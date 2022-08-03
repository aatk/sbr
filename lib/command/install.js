const {getDotEnv, envToObject} = require("./gl/services");
const axios = require("axios");
const Zip = require("adm-zip");
const fs = require("fs");

function installNodeCMS (data) {
    //
    let testAppend = "/test"
    let thisPath = process.sbr.nowPath+testAppend;
    let zipData = Buffer.from(data.data, "base64");
    let zip = new Zip(zipData);

    let name = data.manifest.name;
    fs.mkdirSync(`${thisPath}/${name}`, { recursive: true });
    zip.extractAllTo(`${thisPath}/ext_modules/${name}`);

    console.log(thisPath);

}

function installReactCMS (data) {
    //
}

function installNpm (data) {
    //
}

module.exports = async () => {
    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);

    console.log("install", process.sbr.argv);
    let packageName = process.sbr.argv[1];
    let version = '';
    if (packageName.indexOf("@") > 0) {
        let packageInfo = packageName.split("@");
        packageName = packageInfo[0];
        version = packageInfo[1];
    }

    try {
        let headers = JSON.parse(params.HEADERS);
        let response = await axios.get(`${params.STORE}/appstore/app/${packageName}/${version}`, {headers: headers});
        //console.error(response.data);
        let type = response.data.manifest.type;
        switch (type) {
            case 'NodeCMS':
                installNodeCMS(response.data);
                break;
            case 'ReactCMS':
                installReactCMS(response.data);
                break;
            default:
                installNpm(response.data);
                break;
        }
    }
    catch (e) {
        console.error(e.message)
    }

}
