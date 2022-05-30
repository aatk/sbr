const { exec } = require("child_process");

module.exports = function () {
    let commandText = process.sbr.argv.slice(1).join(" ");
    exec(`npm run ${commandText}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
}

// const { spawn } = require("child_process");
// exec("ls -la", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });
// const ls = spawn("ls", ["-la"]);
// ls.stdout.on("data", data => {
//     console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on("data", data => {
//     console.log(`stderr: ${data}`);
// });
//
// ls.on('error', (error) => {
//     console.log(`error: ${error.message}`);
// });
//
// ls.on("close", code => {
//     console.log(`child process exited with code ${code}`);
// });
