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
};

function getTypeSeparator(types) {
  switch (types.type) {
    case FIELD_TYPES.ARRAY:
      return "|";
    case FIELD_TYPES.MAP:
      return "/";
    default:
      return ",";
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

function parseType(t) {
  if (t == undefined || typeof(t) != 'string' || t.startsWith("#")) {
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

function formatArray(fmt, types, value) {
  var buffer = []
  switch (types.type) {
    case FIELD_TYPES.ARRAY:
      var items = value.split("|");
      buffer.push(fmt.arrayBrace.left);
      {
        for (var i = 0; i < items.length; i++) {
          buffer.push(parseValue(fmt, types, items[i]));
          if (i + 1 < items.length) {
            buffer.push(", ");
          }
        }
      }
      buffer.push(fmt.arrayBrace.right);
      break;
    case FIELD_TYPES.MAP:
      var items = value.split("|");
      buffer.push(fmt.arrayBrace.left);
      {
        for (var i = 0; i < items.length; i++) {
          buffer.push(parseValue(fmt, types, items[i]));
          if (i + 1 < items.length) {
            buffer.push(", ");
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

function formatMap(fmt, types, value) {
  var buffer = []
  buffer.push(fmt.objectBrace.left);
  var items = value.split("/");
  for (var i = 0; i < items.length; i++) {
    var t = types[i];
    buffer.push(fmt.keyWrap.left + t.key + fmt.keyWrap.right)
    buffer.push(fmt.objectBrace.equal + parseValue(fmt, t.type, items[i]));
    if (i + 1 < items.length) {
      buffer.push(", ");
    }
  }
  buffer.push(fmt.objectBrace.right);
  return buffer.join('');
}

function parseValue(fmt, types, value) {
  value = parseDefault(types.type, value)
  switch (types.type) {
    case FIELD_TYPES.BOOLEAN:
      return value == "0" ? "false" : "true";
    case FIELD_TYPES.INTEGER:
    case FIELD_TYPES.FLOAT:
      return value;
    case FIELD_TYPES.STRING:
      return "\"" + value + "\"";
    case FIELD_TYPES.ARRAY:
    case FIELD_TYPES.MULTI_LINE_ARRAY:
      return formatArray(fmt, types.subType, value);
    case FIELD_TYPES.MAP:
      return formatMap(fmt, types.subTypes, value);
  }
  return "ERROR";
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

  getTypeSeparator: getTypeSeparator,
  isSkipType: isSkipType,
  parseType: parseType,
  parseValue: parseValue
});
