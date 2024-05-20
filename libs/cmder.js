const path = require("path");
const reader = require('./reader');
const exporters = require("./exporters")
const inquirer = require('inquirer');

var configs = null
var xlsxList = null
var exportTypes = []
var exportOption = "Export all"

function showExportType() {
    inquirer.prompt({
        type: 'checkbox',
        name: 'types',
        message: 'Please select the export type:',
        choices: [
            { name: 'Json', value: 'Json', checked: exportTypes.indexOf("Json") != -1 },
            { name: 'C#', value: 'C#', checked: exportTypes.indexOf("C#") != -1 },
            { name: 'Lua', value: 'Lua', checked: exportTypes.indexOf("Lua") != -1 },
        ],
        validate(answer) {
            if (answer.length < 1) {
                return 'You must choose at least one type.';
            }
            return true;
        },
    }).then((answers) => {
        exportTypes = answers.types
        showExportList();
    });
}

function showExportList() {
    xlsxList = reader.readXlsxFileList(configs.srcePath)

    var choices = ["Settings", "Refresh", "Export all"]
    choices.push(new inquirer.Separator());
    choices = choices.concat(xlsxList)

    function exportAll() {
        xlsxList.forEach(xlsx => {
            exportSheet(xlsx)
        })
    }

    function exportSheet(name) {
        exportTypes.forEach(type => {
            exporters.exportSheets(type, path.join(configs.srcePath, name), configs.destPath[type]);
        })
    }

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
                case "Settings":
                    showExportType();
                    return;
                case "Refresh":
                    xlsxList = reader.readXlsxFileList(configs.srcePath);
                    break;
                case "Export all":
                    exportAll();
                    break;
                default:
                    exportSheet(option)
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
