const fs = require("fs");
const path = require("path")
const reader = require("./reader");
const parser = require("./parser");

const EXPORT_TYPE = {
  JSON: 'json',
  LUA: 'lua',
  CS: 'cs',
};

exporters = {
  [EXPORT_TYPE.JSON]: require("./export-script"),
  [EXPORT_TYPE.LUA]: require("./export-script"),
  [EXPORT_TYPE.CS]: require("./export-cs"),
};

function exportSheets(type, srcePath, destPath) {
  var xlsx = reader.readXlsxContent(srcePath);
  xlsx.sheets.forEach((sheet) => {
    exportSheet(type, sheet, destPath);
  });
}

function exportSheet(type, sheet, destPath) {
  var exporter = exporters[type];
  var fileData = null;

  if (sheet.isConst) {
    fileData = exporter.generateConsts(sheet, type)
  } else {
    fileData = exporter.generate(sheet, type);
  }

  if (!fs.existsSync(destPath)) {
    fs.mkdir(destPath, err => {
      if (err) {
        console.log(err);
        return false;
      }
    });
  }

  var exportPath = path.join(destPath, fileData.fileName);
  fs.writeFile(exportPath, fileData.fileContent, err => {
    if (err) {
      console.error(err);
      return false
    } else {
      return true;
    }
  });
}

module.exports = {
  EXPORT_TYPE: EXPORT_TYPE,
  exportSheets: exportSheets,
}