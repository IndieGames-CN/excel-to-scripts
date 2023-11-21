const fs = require("fs");
const path = require("path")
const log = require("./log")
const reader = require("./reader");

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

function exportAll(type, xlsxList, srcePath, destPaths) {
  xlsxList.forEach(xlsx => {
    exportSheets(type, path.join(srcePath, xlsx), destPaths)
  })
}

function exportSheets(type, srcePath, destPaths) {
  log.info('Export: ' + srcePath);

  var xlsx = reader.readXlsxContent(srcePath);
  xlsx.sheets.forEach((sheet) => {
    try {
      exportSheet(type, sheet, destPaths);
    } catch (error) {
      log.error(error.message + " " + error.stack);
    }
  });
}

function exportSheet(type, sheet, destPaths) {
  log.info('Export: ' + sheet.name);

  var exporter = exporters[type];
  var fileData = null;

  if (sheet.isConst) {
    fileData = exporter.generateConsts(sheet, type)
  } else {
    fileData = exporter.generate(sheet, type);
  }

  destPaths.forEach(dest => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    var exportPath = path.join(dest, fileData.fileName);
    fs.writeFile(exportPath, fileData.fileContent, err => {
      if (err) {
        console.error(clc.red(err));
        return false
      } else {
        return true;
      }
    });
  });
}

module.exports = {
  EXPORT_TYPE: EXPORT_TYPE,
  exportAll: exportAll,
  exportSheets: exportSheets,
}