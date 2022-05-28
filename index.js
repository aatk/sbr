#!/usr/bin/env node
const { exec } = require("child_process");
const package = require("./package.json");
// const { spawn } = require("child_process");

console.log(package.version);
console.log("sbr", process.argv);
console.log("sbr", __dirname);

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

