const {getDotEnv, setDotEnv, envToObject, objectToEnv} = require("./gl/services");

module.exports = function () {

    if (process.sbr.argv[1]) {

        if (process.sbr.argv[1] === "--headers") {
            if (process.sbr.argv[2]) {
                let dotENVContent = getDotEnv();
                let params = envToObject(dotENVContent);
                params["HEADERS"] = process.sbr.argv[2];

                dotENVContent = objectToEnv(params);
                setDotEnv(dotENVContent);

                console.log(`You set store HEADERs to: ${params["HEADERS"]}`);
            }
        } else {
            let dotENVContent = getDotEnv();
            let params = envToObject(dotENVContent);
            params["STORE"] = process.sbr.argv[1];

            dotENVContent = objectToEnv(params);
            setDotEnv(dotENVContent);

            console.log(`You set store to: ${params["STORE"]}`);
        }
    }
}
