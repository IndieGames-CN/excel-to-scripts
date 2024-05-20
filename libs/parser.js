const log = require("./log");

const FIELD_TYPES = {
  SKIP: -1,
  ERROR: 0,
  BOOLEAN: 1,
  INTEGER: 2,
  FLOAT: 3,
  STRING: 4,
  ARRAY: 5,
  MULTI_LINE_ARRAY: 6,
  MAP: 7,
  SUB_TABLE: 8,
  DYNAMIC: 99,
};

const BASE_TYPE_DICT = {
  bool: FIELD_TYPES.BOOLEAN,
  int: FIELD_TYPES.INTEGER,
  float: FIELD_TYPES.FLOAT,
  string: FIELD_TYPES.STRING,
  "[": FIELD_TYPES.ARRAY,
  "*": FIELD_TYPES.MULTI_LINE_ARRAY,
  "{": FIELD_TYPES.MAP,
  "<": FIELD_TYPES.SUB_TABLE,
  "dynamic": FIELD_TYPES.DYNAMIC,
};

function isEmpty(field) {
  var t = typeof (field)
  if (t === 'undefined') {
      return true;
  } else if (t == "string") {
      return !field.trim() || field.trim().length === 0
  } else {
      return false;
  }
}

function getTypeSeparator(field) {
  switch (field.type) {
    case FIELD_TYPES.ARRAY:
    case FIELD_TYPES.MAP:
      return "|";
    default:
      return ",";
  }
}

function getColumLength(types) {
  var length = 0;
  for (var i = 0; i < types.length; i++) {
    if (!isSkipType(types[i].type)) {
      length = i + 1;
    }
  }
  return length;
}

function processingData(fields, columns, idx) {
  var field = fields[idx]

  if (field.type == FIELD_TYPES.MULTI_LINE_ARRAY) {
    var values = [];
    var separator = getTypeSeparator(field.subType)

    var first = columns[idx]
    if (!isEmpty(first)) {
      values.push(columns[idx]);
      values.push(separator);
    }

    for (var i = idx + 1; i < columns.length; i++) {
      var field = fields[i]
      if (field == null) {
        break
      }
      var columnType = field.type
      if (isSkipType(columnType)) {
        var value = columns[i];
        if (isEmpty(value)) {
          continue;
        }
        values.push(value);
        values.push(separator);
      } else {
        break;
      }
    }

    if (values.length > 0) {
      values.pop();
    }

    return values.join('');
  } else {
    return columns[idx];
  }
}

const parseCollectionType = {
  [FIELD_TYPES.ARRAY]: function (t) {
    var pattern = /^\[(.+)\]$/;
    var result = pattern.exec(t);
    if (result == null) {
      return { type: FIELD_TYPES.ERROR };
    }

    var subType = parseType(result[1]);
    if (subType == null) {
      return { type: FIELD_TYPES.ERROR };
    } else {
      return { type: FIELD_TYPES.ARRAY, subType: subType };
    }
  },
  [FIELD_TYPES.MULTI_LINE_ARRAY]: function (t) {
    var pattern = /^\*(.+)/
    var result = pattern.exec(t);
    if (result == null) {
      return { type: FIELD_TYPES.ERROR };
    }

    var subType = parseType(result[1]);
    if (subType == null) {
      return { type: FIELD_TYPES.ERROR };
    } else {
      return { type: FIELD_TYPES.MULTI_LINE_ARRAY, subType: subType };
    }
  },
  [FIELD_TYPES.MAP]: function (t) {
    var pattern = /^\{(.+)\}$/;
    var result = pattern.exec(t);
    if (result == null) {
      return { type: FIELD_TYPES.ERROR };
    }

    var mapType = { type: FIELD_TYPES.MAP, subTypes: [] };
    result[1].split(",").forEach((st) => {
      var pair = st.split("=");
      mapType.subTypes.push({ key: pair[0], type: parseType(pair[1]) });
    });
    return mapType;
  },
  [FIELD_TYPES.SUB_TABLE]: function (t) {
    var pattern = /\<((\w|,|\s)+)\>/;
    var result = pattern.exec(t);
    if (result == null) {
      return { type: FIELD_TYPES.ERROR };
    }

    var subType = parseType(result[1]);
    if (subType == null) {
      return { type: FIELD_TYPES.ERROR };
    } else {
      return { type: FIELD_TYPES.SUB_TABLE, subType: subType };
    }
  },
};

function parseFields(types, names) {
  var fields = [];
  for (var i = 0; i < types.length; i++) {
    var field = parseType(types[i]);

    if (field.type == FIELD_TYPES.ERROR) {
      log.error("Field type error, name: " + names[i])
    }

    fields.push(field);
  }
  return fields
}

function parseType(t) {
  if (t == undefined || typeof (t) != 'string' || t.startsWith("#")) {
    return { type: FIELD_TYPES.SKIP };
  }

  if (BASE_TYPE_DICT[t]) {
    return { type: BASE_TYPE_DICT[t] };
  }

  var ctype = BASE_TYPE_DICT[t[0]];
  if (ctype == null) {
    return { type: FIELD_TYPES.ERROR };
  }
  return parseCollectionType[ctype](t);
}

function parseDefault(type, value) {
  if (typeof (value) == 'string') {
    value = value.trim()
  }

  if (value != undefined && value !== "") {
    return value;
  }

  switch (type) {
    case FIELD_TYPES.BOOLEAN:
      return "0";
    case FIELD_TYPES.INTEGER:
    case FIELD_TYPES.FLOAT:
      return "0";
    default:
      return "";
  }
}

function splitPlus(str, sep) {
  var a = str.trim().split(sep)
  if (a[0] == '' && a.length == 1) return [];
  return a;
}

function formatArray(fmt, field, value) {
  value = value.toString();

  var buffer = []
  switch (field.type) {
    case FIELD_TYPES.ARRAY:
      buffer.push(fmt.arrayBrace.left);
      {
        var items = splitPlus(value, "|");
        for (var i = 0; i < items.length; i++) {
          buffer.push(parseValue(fmt, field, items[i]));
          if (i + 1 < items.length) {
            buffer.push(", ");
          }
        }
      }
      buffer.push(fmt.arrayBrace.right);
      break;
    case FIELD_TYPES.MAP:
      buffer.push(fmt.arrayBrace.left);
      {
        var items = splitPlus(value, "|");
        for (var i = 0; i < items.length; i++) {
          buffer.push(parseValue(fmt, field, items[i]));
          if (i + 1 < items.length) {
            buffer.push(", ");
          }
        }
      }
      buffer.push(fmt.arrayBrace.right);
      break;
    case FIELD_TYPES.STRING:
    case FIELD_TYPES.DYNAMIC:
      buffer.push(fmt.arrayBrace.left);
      {
        var items = splitPlus(value, ",");
        for (var i = 0; i < items.length; i++) {
          buffer.push(parseValue(fmt, field, items[i]));
          if (i + 1 < items.length) {
            buffer.push(",");
          }
        }
      }
      buffer.push(fmt.arrayBrace.right);
      break;
    default:
      buffer.push(fmt.arrayBrace.left + value + fmt.arrayBrace.right);
  }
  return buffer.join('');
}

function formatMap(fmt, fields, value) {
  var buffer = []
  buffer.push(fmt.objectBrace.left);

  var items = value.split("/");
  var itemDiff = fields.length - items.length;
  for (var i = 0; i < itemDiff; i++) {
    items.push('');
  }

  for (var i = 0; i < items.length; i++) {
    if (i >= fields.length) {
      break;
    }
    var field = fields[i];
    buffer.push(fmt.keyWrap.left + field.key + fmt.keyWrap.right)
    buffer.push(fmt.objectBrace.equal + parseValue(fmt, field.type, items[i]));
    if (i + 1 < items.length) {
      buffer.push(", ");
    }
  }
  buffer.push(fmt.objectBrace.right);
  return buffer.join('');
}

function formatString(value) {
  if (typeof (value) == "string" && value.includes("\"")) {
    return "'" + value + "'";
  } else {
    return "\"" + value + "\"";
  }
}

function parseValue(fmt, field, value) {
  value = parseDefault(field.type, value)
  switch (field.type) {
    case FIELD_TYPES.BOOLEAN:
      return value == "0" ? "false" : "true";
    case FIELD_TYPES.INTEGER:
    case FIELD_TYPES.FLOAT:
      return value;
    case FIELD_TYPES.STRING:
      return formatString(value);
    case FIELD_TYPES.ARRAY:
    case FIELD_TYPES.MULTI_LINE_ARRAY:
      return formatArray(fmt, field.subType, value);
    case FIELD_TYPES.MAP:
      return formatMap(fmt, field.subTypes, value);
    case FIELD_TYPES.DYNAMIC:
      return parseDynamic(fmt, field, value);
  }
  return "ERROR";
}

function isNumeric(str) {
  return !isNaN(str) && !isNaN(parseFloat(str))
}

function isBoolean(str) {
  if (typeof str == "string")
    return str == "true" || str == "false" ? true : false;
  return false;
}

function parseDynamic(fmt, field, value) {
  if (isNumeric(value)) {
    value = value * 1
    if (value % 1 === 0) {
      type = FIELD_TYPES.INTEGER;
    } else {
      type = FIELD_TYPES.FLOAT;
    }
  } else if (isBoolean(value)) {
    type = FIELD_TYPES.BOOLEAN;
    value = value == "true" ? 1 : 0;
  } else {
    type = FIELD_TYPES.STRING;
  }

  field.type = type;
  var value = parseValue(fmt, field, value);
  field.type = FIELD_TYPES.DYNAMIC;
  return value;
}

function isSkipType(type) {
  return type == FIELD_TYPES.SKIP || type == FIELD_TYPES.ERROR;
}

module.exports = Object.freeze({
  MIN_ROWS: 5,
  MIN_CONST_ROWS: 2,
  MIN_CONST_COLUMNS: 3,

  FIELD_TYPES: FIELD_TYPES,
  FIELD_TYPE_DICT: BASE_TYPE_DICT,

  isEmpty: isEmpty,
  isSkipType: isSkipType,
  formatString: formatString,
  getColumLength: getColumLength,
  getTypeSeparator: getTypeSeparator,
  processingData: processingData,
  parseFields: parseFields,
  parseType: parseType,
  parseValue: parseValue,
  parseDefault: parseDefault,
});
