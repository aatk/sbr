const path = require("path");
const package = require("../package.json");

const publish = require("./command/publish");
const login = require("./command/login");
const install = require("./command/install");
const uninstall = require("./command/uninstall");
const run = require("./command/run");
const setStore = require("./command/setstore");
const getStore = require("./command/getstore");
const init = require("./command/init");
const start = require("./command/start");

module.exports = async process => {
    process.sbr = {};
    process.sbr.PWD = process.env.PWD;
    process.sbr.argv = process.argv.slice(2);
    process.sbr.nowPath = path.dirname(require.main.filename);

    switch (process.sbr.argv[0]) {
        case "publish":
            publish();
            break;
        case "i" :
        case "install" :
            install();
            break;
        case "ui" :
        case "uninstall" :
            uninstall();
            break;
        case "login":
            login();
            break;
        case "setstore":
            setStore();
            break;
        case "getstore":
            getStore();
            break;
        case "run":
            run();
            break;
        case "init":
            await init();
            break;
        case "start":
            await start();
            break;
        default:
            break;
    }

}
