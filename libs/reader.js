const fs = require("fs");
const path = require("path");
const xlsx = require("node-xlsx");

function readXlsxFileList(dirName) {
  var fileList = [];

  if (!fs.existsSync(dirName)) {
    return fileList;
  }

  files = fs.readdirSync(dirName);
  files.forEach((file) => {
    if (path.extname(file) == ".xlsx" && file.slice(0, 2) != "~$") {
      fileList.push(file);
    }
  });

  return fileList;
}

function readXlsxContent(filePath) {
  var fileSheets = {
    file: path.basename(filePath),
    sheets: [],
  };

  if (!fs.existsSync(filePath)) {
    return fileSheets;
  }

  const workSheets = xlsx.parse(filePath);
  workSheets.forEach((sheet) => {
    if (!sheet.name.startsWith("#")) {
      sheet.isConst = sheet.name.toLowerCase().indexOf("const") != -1
      fileSheets.sheets.push(sheet);
    }
  });

  return fileSheets;
}

module.exports = {
  readXlsxFileList: readXlsxFileList,
  readXlsxContent: readXlsxContent,
};
