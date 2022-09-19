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
const audit = require("./command/audit");
const create = require("./command/create");
const createStore = require("./command/createStore");

module.exports = async process => {
    process.sbr = {};
    process.sbr.PWD = process.env.PWD;
    process.sbr.argv = process.argv.slice(2);
    process.sbr.nowPath = path.dirname(require.main.filename);

    console.log(process.sbr);
    
    switch (process.sbr.argv[0]) {
        case "publish":
            await publish(process.sbr.argv);
            break;
        case "i" :
        case "install" :
            await install();
            break;
        case "ui" :
        case "uninstall" :
            await uninstall();
            break;
        case "login":
            await login();
            break;
        case "create":
            await create();
            break;
        case "createstore":
            await createStore();
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
        case "audit":
            await audit();
            break;
        default:
            break;
    }

}
