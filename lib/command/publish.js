const Zip = require("adm-zip");

module.exports = function () {

    let PWD = process.sbr.PWD;
    let packageCMP = require(PWD+'/package.json');

    let pathArray = PWD.split("/");
    let zipName = pathArray[pathArray.length - 1];

    let zip = new Zip();
    zip.addLocalFolder(PWD, zipName, (name) => {return name[0] !== "."});
    let zipBuffer = zip.toBuffer();
    console.log(zipBuffer);

}
