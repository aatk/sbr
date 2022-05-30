const {getDotEnv, setDotEnv, envToObject, objectToEnv} = require("./gl/services");

module.exports = function () {

    if (process.sbr.argv[1]) {

        let dotENVContent = getDotEnv();
        let params = envToObject(dotENVContent);
        params["STORE"] = process.sbr.argv[1];

        dotENVContent = objectToEnv(params);
        setDotEnv(dotENVContent);

        console.log(`You set store to: ${params["STORE"]}`);
    }
}
