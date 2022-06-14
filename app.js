const fs = require('fs')
const path = require('path')
const cmder = require('./libs/cmder');

var configPath = path.join(process.cwd(), "./config.json");
var configs = null;
if (!fs.existsSync(configPath)) {
    configs = {
        "srcePath": "./data/input",
        "destPath": "./data/output"
    }
    fs.writeFileSync("config.json", JSON.stringify(configs, null, 4))
} else {
    configs = JSON.parse(fs.readFileSync(configPath, "utf8"))
}

cmder.start(configs.srcePath, configs.destPath)