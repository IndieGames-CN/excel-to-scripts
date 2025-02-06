const util = require('util');
const log = require("./log");
const parser = require('./parser');
const config = require("config");

const CLASS_NAMESPACE = config.get("options.namespace");
const CLASS_BASECLASS = config.get("options.baseClass")

const FIELD_TYPES = parser.FIELD_TYPES;

const CLASS_FIELD = "\t\tpublic %s %s { get; set; } \n";
const CLASS_FIELD_DESC = "\t\tpublic %s %s { get; set; } // %s \n";
const CLASS_STATIC_FIELd = "\t\tpublic static %s %s; // %s \n";

function getNamespace() {
    return CLASS_NAMESPACE === null ? "Configs" : CLASS_NAMESPACE;
}

function getBaseClass() {
    return CLASS_BASECLASS === null ? "" : (" : " + CLASS_BASECLASS);
}

const CLASS_BASE = "\tpublic class %s\n"
    + "\t{\n"
    + "%s"
    + "\t}\n";
const CLASS_DATA = "\tpublic class %s" + getBaseClass() + "\n"
    + "\t{\n"
    + "%s"
    + "\t}\n";
const CLASS_ITEM = "\tpublic class %s\n"
    + "\t{\n"
    + "%s"
    + "\t}\n\n";
const NAMESPACE_TEMPLATE = "%s"
    + "namespace " + getNamespace() + "\n"
    + "{\n"
    + "%s"
    + "}";
const ENUM_TEMPLATE = "\tpublic enum %s\n\t{\n%s\t}"
const FIELD_TEMPLATE = "\t\t%s = %s"

const FILE_SUFFIX = ".cs"

const CS_TYPES = {
    [FIELD_TYPES.BOOLEAN]: "bool",
    [FIELD_TYPES.INTEGER]: "int",
    [FIELD_TYPES.FLOAT]: "float",
    [FIELD_TYPES.STRING]: "string",
}

const CS_LIBS = {
    UnityEngine: "UnityEngine",
    Collections: "System.Collections.Generic",
}

function formatCSType(name, field, items) {
    var baseType = CS_TYPES[field.type]
    if (baseType != null) {
        return baseType;
    }

    if (field.type == FIELD_TYPES.ARRAY || field.type == FIELD_TYPES.MULTI_LINE_ARRAY) {
        return "List<" + formatCSType(name, field.subType, items) + ">";
    }

    if (field.type == FIELD_TYPES.MAP) {
        var name = formatItemName(name)
        items.push({ field: field, name: name });
        return name;
    }

    return "object";
}

function formatItemName(string) {
    if (string[string.length - 1] == "s") {
        string = string.slice(0, -1)
    }
    return util.format("%sItem", string)
}

function capitalizeFirstLetter(string) {
    if (string.length > 1) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
        return string;
    }
}

function generateItems(items) {
    var buffer = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i]
        var itemBuffer = []
        var field = item.field;
        var fieldLength = field.subTypes.length;

        for (var j = 0; j < fieldLength; j++) {
            var type = field.subTypes[j]
            var name = capitalizeFirstLetter(type.key);
            itemBuffer.push(util.format(CLASS_FIELD, formatCSType(name, type.type), name))
        }
        buffer.push(util.format(CLASS_ITEM, item.name, itemBuffer.join("")))
    }
    return buffer.join("");
}

function generateUsings(usings) {
    var buffer = [];
    usings.forEach(function (value1, value2, set) {
        buffer.push(util.format("using %s;\n", value2))
    })
    return buffer.join("") + "\n";
}

function generate(sheet) {
    var descs = sheet.data[0];
    var names = sheet.data[1];
    var types = sheet.data[2];
    var flags = sheet.data[3];
    var fields = parser.parseFields(types, names);

    const items = [];
    const buffer = [];
    const usings = new Set();

    for (var i = 1; i < fields.length; i++) {
        var field = fields[i]
        if (parser.isSkipType(field.type)) {
            continue;
        }
        var fieldClass = flags[i]
        if (parser.isEmpty(fieldClass)) {
            fieldClass = formatCSType(names[i], field, items);
        } else {
            usings.add(CS_LIBS.UnityEngine);
        }

        if (fieldClass.includes("List")) {
            usings.add(CS_LIBS.Collections);
        }

        buffer.push(util.format(CLASS_FIELD_DESC, fieldClass, names[i], descs[i]));
    }

    var usingStr = generateUsings(usings);
    var itemStr = generateItems(items);
    var sheetStr = util.format(CLASS_DATA, sheet.name, buffer.join(''))

    return {
        fileName: sheet.name + FILE_SUFFIX,
        fileContent: util.format(NAMESPACE_TEMPLATE, usingStr, itemStr + sheetStr),
    };
}

function generateConsts(sheet) {
    const items = [];
    const buffer = [];
    const usings = new Set();

    for (var i = 1; i < sheet.data.length; i++) {
        var data = sheet.data[i];

        if (data.length < 4) {
            break;
        }

        var name = data[0];
        var field = parser.parseType(data[1]);
        var desc = data[3];

        if (parser.isEmpty(name)) {
            continue;
        }

        if (parser.isSkipType(field.type)) {
            log.error(`Data type error, skip current row[${name}] data`)
            continue;
        }

        var type = formatCSType(name, field, items);
        if (type.includes("List")) {
            usings.add(CS_LIBS.Collections);
        }

        buffer.push(util.format(CLASS_FIELD_DESC, type, name, desc))
    }

    var usingStr = generateUsings(usings);
    var itemStr = generateItems(items);
    var sheetStr = util.format(CLASS_BASE, sheet.name, buffer.join(''))

    return {
        fileName: sheet.name + FILE_SUFFIX,
        fileContent: util.format(NAMESPACE_TEMPLATE, usingStr, itemStr + sheetStr),
    };
}

function generateEnums(sheet) {
    const buffer = [];

    for (var i = 1; i < sheet.data.length; i++) {
        var data = sheet.data[i];
        var name = data[0];
        var value = data[1];

        if (parser.isEmpty(value)) {
            buffer.push("\t\t" + name);
        } else {
            buffer.push(util.format(FIELD_TEMPLATE, name, value));
        }

        if (i < sheet.data.length) {
            buffer.push(",");
        }

        buffer.push("\n");
    }

    var enumName = sheet.name.substring(0, sheet.name.length - 4);
    var enumStr = util.format(ENUM_TEMPLATE, enumName, buffer.join('')) + "\n";

    return {
        fileName: enumName + FILE_SUFFIX,
        fileContent: util.format(NAMESPACE_TEMPLATE, "", enumStr)
    }
}

module.exports = {
    generate: generate,
    generateConsts: generateConsts,
    generateEnums: generateEnums,
}