const clc = require("cli-color");

function info(msg) {
    console.log(clc.green(`- ${msg}`));
}

function error(msg) {
    console.log(clc.red(`  ! ${msg}`));
}

module.exports = {
    info: info,
    error: error,
}