const util = require('util');
const log = require("./log");
const parser = require("./parser");

var fmt = {
    fileSuffix: '.json',
    fileHead: "",
    keyWrap: { left: "\"", right: "\"" },
    arrayBrace: { left: "[", right: "]" },
    objectBrace: { left: "{", equal: ": ", right: "}" },
};

function generate(sheet) {
    var names = sheet.data[1];
    var types = sheet.data[2];
    var fields = parser.parseFields(types, names);

    const buffer = []
    buffer.push(fmt.arrayBrace.left + "\n");

    var keys = new Map();
    for (var i = 4; i < sheet.data.length; i++) {
        var columns = sheet.data[i];
        var columnLen = parser.getColumLength(fields)

        var id = columns[0];
        if (typeof id === 'string' && id.startsWith("#")) {
            continue;
        }

        if (keys.has(id)) {
            log.error("Duplicate ID: " + id + ", Row: " + i);
        }
        else {
            keys.set(id, true)
        }

        if (parser.isEmpty(columns[0])) {
            if (i > 4) {
                buffer.pop(); // remove line break
            }
            break;
        }

        buffer.push("\t" + fmt.objectBrace.left);
        for (var j = 0; j < columnLen; j++) {
            var field = fields[j];

            if (parser.isSkipType(field.type)) {
                continue;
            }

            buffer.push(util.format("\"%s\":%s", names[j], parser.parseValue(fmt, field, parser.processingData(fields, columns, j))))

            if (j + 1 < columnLen) {
                buffer.push(", ");
            }
        }
        buffer.push(fmt.objectBrace.right);
        if (i + 1 < sheet.data.length) {
            buffer.push(",\n");
        }
    }
    buffer.push("\n" + fmt.arrayBrace.right);

    return {
        fileName: sheet.name + fmt.fileSuffix,
        fileContent: buffer.join(''),
    };
}

function generateConsts(sheet) {
    const buffer = []

    buffer.push(fmt.objectBrace.left + "\n");
    for (var i = 1; i < sheet.data.length; i++) {
        var data = sheet.data[i];

        if (data.length <= 0) {
            continue;
        }

        var name = data[0];
        if (parser.isEmpty(name)) {
            continue;
        }

        if (data.length < 4) {
            break;
        }

        var types = parser.parseType(data[1]);
        var value = parser.parseValue(fmt, types, data[2]);

        if (parser.isSkipType(types.type)) {
            console.log(types)
            log.error(`Data type error, skip current row[${name}] data`)
            continue;
        }

        buffer.push("\t" + fmt.keyWrap.left + name.toUpperCase() + fmt.keyWrap.right)
        buffer.push(fmt.objectBrace.equal + value);
        buffer.push(",\n");
    }

    if (buffer.length > 1) {
        buffer.pop();
    }
    buffer.push("\n" + fmt.objectBrace.right);

    return {
        fileName: sheet.name + fmt.fileSuffix,
        fileContent: buffer.join(''),
    };
}

function generateEnums() {
    return null;
}

module.exports = {
    generate: generate,
    generateConsts: generateConsts,
    generateEnums: generateEnums,
}