const fs = require("fs");
const path = require("path")
const reader = require("./reader");
const { parseType, isSkip, FIELD_TYPES } = require("./types");

const EXPORT_TYPE = {
  JSON: 'json',
  LUA: 'lua',
  CS: 'cs',
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
  var exporter = exporters[type];
  var content = getSheetContent(exporter, sheet);

  if (!fs.existsSync(destPath)) {
    fs.mkdir(destPath, err => {
      if (err) {
        console.log(err);
        return false;
      }
    });
  }

  var exportPath = path.join(destPath, sheet.name + exporter.fileSuffix);
  fs.writeFile(exportPath, content, err => {
    if (err) {
      console.error(err);
      return false
    } else {
      return true;
    }
  });
}

function getSheetContent(exporter, sheet) {
  var descs = sheet.data[0];
  var names = sheet.data[1];
  var types = parseTypes(sheet.data[2]);

  var columnLen = types.length;

  const buffer = []
  buffer.push("return {\n");
  writeFileds(buffer, types, descs)
  writeFileds(buffer, types, names)

  for (var i = 4; i < sheet.data.length; i++) {
    var columns = sheet.data[i];

    buffer.push("\t{");
    for (var j = 0; j < columnLen; j++) {
      var columnType = types[j];
      var columnValue = columns[j];
      if (isSkip(columnType.type)) {
        continue;
      }
      buffer.push(exporter.formatValue(columnType, columnValue))
      if (j + 1 < columnLen) {
        buffer.push(", ");
      }
    }
    if (i + 1 < sheet.data.length) {
      buffer.push("},\n");
    }
    else {
      buffer.push("}")
    }
  }
  buffer.push("\n}");

  return buffer.join('');
}

function parseTypes(types) {
  var field_types = [];
  for (var i = 0; i < types.length; i++) {
    field_types.push(parseType(types[i]));
  }
  return field_types
}

function writeFileds(buffer, types, fields) {
  buffer.push("\t{");
  for (var i = 0; i < fields.length; i++) {
    var columnType = types[i];
    if (isSkip(columnType.type)) {
      continue;
    }
    buffer.push("\"" + fields[i] + "\"")
    if (i + 1 < fields.length) {
      buffer.push(", ");
    }
  }
  buffer.push("},\n");
}

module.exports = {
  EXPORT_TYPE: EXPORT_TYPE,
  exportSheets: exportSheets,
}