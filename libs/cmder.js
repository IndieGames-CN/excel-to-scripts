const path = require("path");
const reader = require('./reader');
const exporters = require("./exporters")
const inquirer = require('inquirer');
const config = require("config");

var xlsxList = null;
var exportTypes = config.get("options.outputTypes");
var exportOption = "Export all";

var pathXlsx = config.get("path.xlsx");
var pathOutput = config.get("path.output");

function showExportList() {
    xlsxList = reader.readXlsxFileList(pathXlsx)

    var choices = ["Refresh", "Export all"]
    choices.push(new inquirer.Separator());
    choices = choices.concat(xlsxList)

    function exportAll() {
        xlsxList.forEach(xlsx => {
            exportSheet(xlsx)
        })
    }

    function exportSheet(name) {
        exportTypes.forEach(type => {
            exporters.exportSheets(type, path.join(pathXlsx, name), pathOutput[type]);
        })
    }

    inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'option',
                message: 'Select the export file (' + exportTypes + "):",
                default: exportOption,
                choices: choices,
                pageSize: 30,
            },
        ])
        .then((answers) => {
            var option = answers.option;
            switch (option) {
                case "Refresh":
                    xlsxList = reader.readXlsxFileList(pathXlsx);
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

function start() {
    xlsxList = reader.readXlsxFileList(pathXlsx)
    showExportList();
}

module.exports = {
    start: start,
};
