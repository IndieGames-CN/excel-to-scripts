const fs = require('fs')
const path = require('path')
const cmder = require('./libs/cmder');

const defaultConfigs = {
    "srcePath": "./data",
    "destPath": {
        ['Json']: ["./dist/output/json"],
        ['Lua']: ["./dist/output/lua"],
        ['C#']: ["./dist/output/cs"],
    }
}

const args = process.argv.slice(2)
var configPath;
if (args.length > 0) {
    configPath = path.join(process.cwd(), "./" + args[0]);
}
else {
    configPath = path.join(process.cwd(), "./config.json");
}

console.log("config path: " + configPath);

var configs = null;
if (!fs.existsSync(configPath)) {
    configs = defaultConfigs
    fs.writeFileSync("config.json", JSON.stringify(configs, null, 4))
} else {
    configs = JSON.parse(fs.readFileSync(configPath, "utf8"))
}

cmder.start(configs)