const package = require("../package.json");
const publish = require("./command/publish");

module.exports = async process => {
    process.sbr = {};
    process.sbr.PWD = process.env.PWD;
    process.sbr.argv = process.argv.slice(2);
    console.log("sbr", process.sbr);

    publish("test");
}
