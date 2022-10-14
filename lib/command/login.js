const {getDotEnv, setDotEnv, envToObject, objectToEnv} = require("./gl/services");
const readline = require('readline');
const https = require('https');
const $api = require("./gl/api");

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

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    function ask(question) {
        return new Promise(resolve => {
            rl.question(question, input => resolve(input));
        });
    }

    let login = await ask("Login: ");
    let password = await ask("Password: ");

    await rl.close();

    let headers = {};
    if (params.HEADERS) {
        headers = JSON.parse(params.HEADERS);
    }
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
    
        let response = await $api.post(params.STORE+"/auth/login", {login, password}, {
            headers: headers,
            withCredentials: true,
            httpsAgent: agent
        });
        if (response.status === 200) {
            let cookie = response.headers['set-cookie'][0];
            let cookies = parseCookies(cookie);

            params.COOKIES = cookies
            dotENVContent = objectToEnv(params);
            setDotEnv(dotENVContent);

            console.log("You have logged in!");
        }
    } catch (e) {
        console.error("AXIOS ERROR", e.message);
        console.error("AXIOS ERROR", e);
    }

}
