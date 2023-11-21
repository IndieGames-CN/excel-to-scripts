const fs = require('fs')
const path = require('path')
const cmder = require('./libs/cmder');

const defaultConfigs = {
    "srcePath": "./data",
    "destPath": {
        ['json']: ["./dist/output/json"],
        ['lua']: ["./dist/output/lua"],
        ['cs']: ["./dist/output/cs"],
    }
}

var configPath = path.join(process.cwd(), "./config.json");
var configs = null;
if (!fs.existsSync(configPath)) {
    configs = defaultConfigs
    fs.writeFileSync("config.json", JSON.stringify(configs, null, 4))
} else {
    configs = JSON.parse(fs.readFileSync(configPath, "utf8"))
}

cmder.start(configs)