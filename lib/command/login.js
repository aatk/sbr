const readlinePromises = require('node:readline/promises');

module.exports = async () => {

    let dotENVContent = getDotEnv();
    let params = envToObject(dotENVContent);

    console.log("sbr", process.sbr);
    console.log("params", params);

    const rl = readlinePromises.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let login = await rl.question("Login: ");
    let password = await rl.question("Password: ");

    console.log("login", login);
    console.log("password", password);

    await rl.close();

}
