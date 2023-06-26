const path = require("path");
const reader = require('./reader');
const exporters = require("./exporters")
const inquirer = require('inquirer');

var configs = null
var xlsxList = null
var exportType = null
var exportOption = "Export all"

function showExportType() {
    inquirer.prompt({
        type: 'list',
        name: 'type',
        message: 'Please select the export type:',
        choices: ['Lua', 'Json', 'CS'],
    }).then((answers) => {
        exportType = answers.type.toLowerCase()
        showExportList();
    });
}

function showExportList() {
    xlsxList = reader.readXlsxFileList(configs.srcePath)

    var choices = ["Refresh", "Export all"]
    choices.push(new inquirer.Separator());
    choices = choices.concat(xlsxList)

    inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'option',
                message: 'Select the export file:',
                default: exportOption,
                choices: choices,
                pageSize: 30,
            },
        ])
        .then((answers) => {
            var option = answers.option;
            switch (option) {
                case "Refresh":
                    xlsxList = reader.readXlsxFileList(configs.srcePath);
                    break;
                case "Export all":
                    exporters.exportAll(exportType, xlsxList, configs.srcePath, configs.destPath[exportType]);
                    break;
                default:
                    exporters.exportSheets(exportType, path.join(configs.srcePath, option), configs.destPath[exportType]);
                    break;
            }

            exportOption = option;
            showExportList();
        });
}

function start(cfgs) {
    configs = cfgs
    xlsxList = reader.readXlsxFileList(configs.srcePath)
    showExportType();
}

module.exports = {
    start: start,
};
