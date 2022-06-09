const FIELD_TYPES = {
  SKIP: -1,
  ERROR: 0,
  BOOLEAN: 1,
  INTEGER: 2,
  FLOAT: 3,
  STRING: 4,
  ARRAY: 5,
  MAP: 6,
  SUB_TABLE: 7,
};

const BASE_TYPE_DICT = {
  bool: FIELD_TYPES.BOOLEAN,
  int: FIELD_TYPES.INTEGER,
  float: FIELD_TYPES.FLOAT,
  string: FIELD_TYPES.STRING,
  "[": FIELD_TYPES.ARRAY,
  "{": FIELD_TYPES.MAP,
  "<": FIELD_TYPES.SUB_TABLE,
};

const collectionTypeParse = {
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
  if (t.startsWith("#")) {
    return { type: FIELD_TYPES.SKIP };
  }

  if (BASE_TYPE_DICT[t]) {
    return { type: BASE_TYPE_DICT[t] };
  }

  var ctype = BASE_TYPE_DICT[t[0]];
  if (ctype == null) {
    return { type: FIELD_TYPES.ERROR };
  }
  return collectionTypeParse[ctype](t);
}

function isSkip(type) {
  return type == FIELD_TYPES.SKIP || type == FIELD_TYPES.ERROR;
}

module.exports = Object.freeze({
  MIN_ROWS: 5,
  MIN_CONST_ROWS: 2,
  MIN_CONST_COLUMNS: 3,

  FIELD_TYPES: FIELD_TYPES,
  FIELD_TYPE_DICT: BASE_TYPE_DICT,

  isSkip: isSkip,
  parseType: parseType,
});
