var reader = require("./reader");
const { parseType } = require("./types");

const EXPORT_TYPE = {
  JSON: 1,
  LUA: 2,
  CS: 3,
};

exporters = {
  [EXPORT_TYPE.JSON]: require("./export-cs"),
  [EXPORT_TYPE.LUA]: require("./export-lua"),
  [EXPORT_TYPE.CS]: require("./export-cs"),
};

function exportSheets(type, srcePath, destPath) {
  var xlsx = reader.readXlsxContent(srcePath);
  xlsx.sheets.forEach((sheet) => {
    exportSheet(type, sheet, destPath);
  });
}

function exportSheet(type, sheet, destPath) {
  var names = sheet.data[1];
  var types = sheet.data[2];
  
  var field_types = [];
  for (var i = 0; i < types.length; i++) {
    field_types.push(parseType(types[i]));
  }

  for (var i = 3; i < sheet.data.length; i++) {
    var line = sheet.data[i];
  }
}

module.exports = {
  EXPORT_TYPE: EXPORT_TYPE,
  exportSheets: exportSheets,
};
