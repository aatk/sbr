const {getDotEnv, setDotEnv, envToObject, objectToEnv} = require("./gl/services");
const readlinePromises = require('node:readline/promises');
const axios = require("axios");


parseCookies = (cookie) => {
    let cookieArray = cookie.split(";");
    let cookieParams = cookieArray[0].split("=");
    let result = {};
    result[cookieParams[0]] = cookieParams[1];
    return result;
}

module.exports = async () => {

    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);

    const rl = readlinePromises.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let login = await rl.question("Login: ");
    let password = await rl.question("Password: ");

    await rl.close();

    let headers = {};
    if (params.HEADERS) {
        headers = JSON.parse(params.HEADERS);
    }
    try {
        let bugSID = await axios.post(params.STORE+"/users/getuserdata", {}, { headers: headers });
        let cookie = bugSID.headers['set-cookie'][0];
        let cookies = parseCookies(cookie);
        headers.Cookie =  `SID=${cookies.SID}`;
        //console.log("bugSID", bugSID.headers);
        console.log("bugSID", headers);

        let response = await axios.post(params.STORE+"/auth/login", {login, password}, { headers: headers });
        if (response.status === 200) {
            let cookie = response.headers['set-cookie'][0];
            let cookies = parseCookies(cookie);

            params.COOKIES = cookies
            dotENVContent = objectToEnv(params);
            setDotEnv(dotENVContent);

            console.log("You have logged in!");
        }

    } catch (e) {
        console.log(e.message);
    }

}
