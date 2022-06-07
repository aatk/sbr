const {getDotEnv, envToObject} = require("./gl/services");

module.exports = function () {

    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);

    console.log(`You store is: ${params["STORE"]}`);
    console.log(`to change store run command: sbr setstore <url>`);
}
