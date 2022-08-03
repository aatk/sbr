const {getDotEnv, envToObject} = require("./gl/services");
const Zip = require("adm-zip");
const axios = require("axios");
const FormData = require("form-data");

objectToCookies = (objectCookies) => {
    let cookies = [];
    for (let name in objectCookies) {
        let value = objectCookies[name];
        cookies.push(`${name}=${value}`);
    }
    return cookies.join("; ");
}

module.exports = async () => {

    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);

    let PWD = process.sbr.PWD;
    let packageCMP = require(PWD+'/package.json');

    let pathArray = PWD.split("/");
    let zipName = '';//pathArray[pathArray.length - 1];

    let zip = new Zip();
    zip.addLocalFolder(PWD, zipName, (name) => {return name[0] !== "."});
    let zipBuffer = zip.toBuffer();
    // console.log(zipBuffer);

    let form = new FormData();
    form.append("name", packageCMP.name);
    form.append("version", packageCMP.version);
    form.append("homepage", packageCMP.homepage);
    form.append("repository", packageCMP.repository.url);


    form.append('upload', zipBuffer, "package.zip");

    let headers = JSON.parse(params.HEADERS);
    // console.log(headers);
    headers["Cookie"] = objectToCookies(JSON.parse(params.COOKIES));
    headers["Content-type"] = "multipart/form-data; boundary=" + form.getBoundary();
    // console.log(headers);

    try {
        let response = await axios.post(params.STORE+"/appstore/app", form, { headers: headers });
        console.log(response.data);
    } catch (e) {
        console.log(e);
    }

}
