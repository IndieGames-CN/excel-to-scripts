const { FIELD_TYPES } = require("./types");

function checkDefault(type, value) {
    if (value && value !== "") {
        return value;
    }

    switch (type) {
        case FIELD_TYPES.BOOLEAN:
            return "0";
        case FIELD_TYPES.INTEGER:
        case FIELD_TYPES.FLOAT:
            return "0";
        case FIELD_TYPES.STRING:
        case FIELD_TYPES.ARRAY:
        case FIELD_TYPES.MAP:
            return "";
    }
}

function formatArray(types, value) {
    var buffer = []
    switch (types.type) {
        case FIELD_TYPES.ARRAY:
            var items = value.split("|");
            buffer.push("{");
            {
                for (var i = 0; i < items.length; i++) {
                    buffer.push(formatValue(types, items[i]));
                    if (i + 1 < items.length) {
                        buffer.push(", ");
                    }
                }
            }
            buffer.push("}");
            break;
        case FIELD_TYPES.MAP:
            var items = value.split("|");
            buffer.push("{");
            {
                for (var i = 0; i < items.length; i++) {
                    buffer.push(formatValue(types, items[i]));
                    if (i + 1 < items.length) {
                        buffer.push(", ");
                    }
                }
            }
            buffer.push("}");
            break;
        default:
            buffer.push("{" + value + "}");
    }
    return buffer.join('');
}

function formatMap(types, value) {
    var buffer = []
    buffer.push("{");
    var items = value.split("/");
    for (var i = 0; i < items.length; i++) {
        var t = types[i];
        buffer.push(t.key + "=" + formatValue(t.type, items[i]));
        if (i + 1 < items.length) {
            buffer.push(", ");
        }
    }
    buffer.push("}");
    return buffer.join('');
}

function formatValue(types, value) {
    value = checkDefault(types.type, value)
    switch (types.type) {
        case FIELD_TYPES.BOOLEAN:
            return value == "0" ? "false" : "true";
        case FIELD_TYPES.INTEGER:
        case FIELD_TYPES.FLOAT:
            return value;
        case FIELD_TYPES.STRING:
            return "\"" + value + "\"";
        case FIELD_TYPES.ARRAY:
            return formatArray(types.subType, value);
        case FIELD_TYPES.MAP:
            return formatMap(types.subTypes, value);
    }
    return "ERROR";
}

module.exports = {
    formatValue: formatValue,
}