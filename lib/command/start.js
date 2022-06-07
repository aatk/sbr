const { spawn } = require("child_process");

module.exports = async () => {
    const npm = spawn("npm", ["start"]);
    npm.stdout.on("data", data => {
        console.log(data.toString());
    });

    npm.stderr.on("data", data => {
        console.log(data.toString());
    });

    npm.on('error', (error) => {
        console.log(error.message.toString());
    });

    npm.on("close", code => {
        console.log(code.toString());
    });

}
