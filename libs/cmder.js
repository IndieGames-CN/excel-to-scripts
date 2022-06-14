const path = require("path");
const reader = require('./reader');
const exporters = require("./exporters")
const inquirer = require('inquirer');

var srcDir = null
var outDir = null
var xlsxList = null
var exportType = null

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
    var xlsxList = reader.readXlsxFileList(srcDir)

    var choices = ["Refresh", "Export all"]
    choices.push(new inquirer.Separator());
    choices = choices.concat(xlsxList)

    inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'option',
                message: 'Select the export file:',
                default: 'Export all',
                choices: choices,
                pageSize: 30,
            },
        ])
        .then((answers) => {
            var option = answers.option;
            switch (option) {
                case "Refresh":
                    xlsxList = reader.readXlsxFileList(srcDir);
                    break;
                case "Export all":
                    exporters.exportAll(exportType, xlsxList, srcDir, outDir);
                    break;
                default:
                    exporters.exportSheets(exportType, path.join(srcDir, option), outDir);
                    break;
            }

            showExportList();
        });
}

function start(src, out) {
    srcDir = src
    outDir = out
    xlsxList = reader.readXlsxFileList(srcDir)
    showExportType();
}

module.exports = {
    start: start,
};
