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
  console.log(type, srcePath, destPath);
  var xlsx = reader.readXlsxContent(srcePath);
  xlsx.sheets.forEach((sheet) => {
    exportSheet(type, sheet, destPath);
  });
}

function exportSheet(type, sheet, destPath) {
  var descs = sheet.data[0];
  var names = sheet.data[1];
  var types = sheet.data[2];

  var field_types = [];
  for (var i = 0; i < types.length; i++) {
    field_types.push(parseType(types[i]));
  }

  var exporter = exporters[type];
  var columnLen = field_types.length;

  const buffer = []
  buffer.push("return {\n");
  writeFileds(buffer, field_types, descs, columnLen)
  writeFileds(buffer, field_types, names, columnLen)

  for (var i = 4; i < sheet.data.length; i++) {
    var columns = sheet.data[i];

    buffer.push("\t{");
    for (var j = 0; j < columnLen; j++) {
      var columnType = field_types[j];
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

  if (!fs.existsSync(destPath)) {
    fs.mkdir(destPath, err => {
      if (err) {
        console.log(err);
        return false;
      }
    });
  }

  var content = buffer.join('');
  fs.writeFile(path.join(destPath, sheet.name + exporter.fileSuffix), content, err => {
    if (err) {
      console.error(err);
      return false
    } else {
      return true;
    }
  });
}

function writeFileds(buffer, types, fields, length) {
  buffer.push("\t{");
  for (var i = 0; i < length; i++) {
    var columnType = types[i];
    if (isSkip(columnType.type)) {
      continue;
    }
    buffer.push("\"" + fields[i] + "\"")
    if (i + 1 < length) {
      buffer.push(", ");
    }
  }
  buffer.push("},\n");
}

module.exports = {
  EXPORT_TYPE: EXPORT_TYPE,
  exportSheets: exportSheets,
};
