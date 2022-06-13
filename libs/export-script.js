const parser = require("./parser");

fmts = {
    "json": {
        fileSuffix: '.json',
        fileHead: "",
        keyWrap: { left: "\"", right: "\"" },
        arrayBrace: { left: "[", right: "]" },
        objectBrace: { left: "{", equal: ": ", right: "}" },
    },
    "lua": {
        fileSuffix: '.lua',
        fileHead: "return ",
        keyWrap: { left: "", right: "" },
        arrayBrace: { left: "{", right: "}" },
        objectBrace: { left: "{", equal: "=", right: "}" },
    },
};

function generate(sheet, type) {
    var fmt = fmts[type]
    var descs = sheet.data[0];
    var names = sheet.data[1];
    var types = parseTypes(sheet.data[2]);

    var columnLen = types.length;

    const buffer = []
    buffer.push(fmt.fileHead + fmt.arrayBrace.left + "\n");
    writeFileds(buffer, fmt, types, descs)
    writeFileds(buffer, fmt, types, names)

    for (var i = 4; i < sheet.data.length; i++) {
        var columns = sheet.data[i];

        buffer.push("\t" + fmt.arrayBrace.left);
        for (var j = 0; j < columnLen; j++) {
            var columnType = types[j];
            var columnValue = columns[j];

            if (columnType.type == parser.FIELD_TYPES.SKIP) {
                continue;
            }

            if (columnType.type == parser.FIELD_TYPES.ERROR) {
                console.error("Field type error, name: " + names[j]);
                continue;
            }

            buffer.push(parser.parseValue(fmt, columnType, columnValue))
            if (j + 1 < columnLen) {
                buffer.push(", ");
            }
        }
        buffer.push(fmt.arrayBrace.right);
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

function parseTypes(types) {
    var field_types = [];
    for (var i = 0; i < types.length; i++) {
        field_types.push(parser.parseType(types[i]));
    }
    return field_types
}

function writeFileds(buffer, fmt, types, fields) {
    buffer.push("\t" + fmt.arrayBrace.left);
    for (var i = 0; i < fields.length; i++) {
        var columnType = types[i];
        if (parser.isSkipType(columnType.type)) {
            continue;
        }
        buffer.push("\"" + fields[i] + "\"")
        if (i + 1 < fields.length) {
            buffer.push(", ");
        }
    }
    buffer.push(fmt.arrayBrace.right + ",\n");
}

function generateConsts(sheet, type) {
    var fmt = fmts[type]
    const buffer = []

    buffer.push(fmt.fileHead + fmt.objectBrace.left + "\n");
    for (var i = 1; i < sheet.data.length; i++) {
        var data = sheet.data[i];
        if (data.length != 4) {
            break;
        }

        var name = data[0].toUpperCase();
        var type = parser.parseType(data[1]);
        var value = parser.parseValue(fmt, type, data[2]);
        var desc = data[3];

        if (parser.isSkipType(type)) {
            continue;
        }

        buffer.push("\t" + fmt.keyWrap.left + name + fmt.keyWrap.right)
        buffer.push(" " + fmt.objectBrace.equal + " " + value);
        buffer.push(",\n");
    }
    buffer.push(fmt.objectBrace.right);

    return {
        fileName: sheet.name + fmt.fileSuffix,
        fileContent: buffer.join(''),
    };
}

module.exports = {
    generate: generate,
    generateConsts: generateConsts,
}