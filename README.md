# Excel To Scripts

`Excel`(.xlsx) file data export to script, high-level programming language tools. Support exporting to different scripting languages such as `Json`, `Lua`, `C#`, etc.

## Packaged application

```
$ git clone https://github.com/Veinin/excel-to-scripts.git
$ cd excel-to-scripts
$ npm run pkgwin
```

## Usage

Start the `excel-to-scripts` executable, which by default detects the configuration file on the first run and automatically generates the configuration file `config.json` if it does not exist.

``` json
{
    "srcePath": "./data",
    "destPath": "./output"
}
```

Where `srcePath` is the Excel file directory and `destPath` is the data export directory.

After launching the executable, perform the export process.

- 1. Use the arrow keys up and down to select the export script type.
- 2. Use the arrow keys up and down to select the export file, or enter the selection number directly.
- 3. Press the Enter key to execute.

![Export](./docs/Export.gif)

## Sheet Format

A single Excel supports multiple Sheet worksheets, with two types of worksheets:

- General Worksheet
- Constant Worksheet

### General Worksheet

A normal worksheet is a traditional Excel configuration where the worksheet is divided into header rows (occupying 4 rows) and content rows.

#### Headers

The table header is divided into 4 rows.

- Comment Name
- Field Name
- Data field type
- Fourth row reserved row (other advanced features)

#### Data Type Description

- Basic Data Types
  - `bool`, boolean (0=false, 1=true)
  - `int`, shape-shifting
  - `float`, floating point
  - `string`, string
- Set types, with generic support
  - `[int]`, arrays
    - `[[int]]`, two-dimensional arrays
    - `[{id=int,num=int}]`, dictionary array
  - `{id=int,num=int}`, dictionary
    - `{id=int,nums=[int]}`, dictionary array
    - `{id=int,nums=[[int]]}`, dictionary two-dimensional array
- Comments, using `#` markup

#### Example of worksheet format

|UID|Describe|||||||
|---|---|---|---|---|---|---|---|
|id||bool_data|int_data|float_data|string_data|arr_data|dic_data|
|int|#|bool|int|float|string|[int]|{id=int,num=int}|
|unique||||||||
|1|a|1|100|1.2|foo|1001, 1002|1001/1002|
|2|b|0|200|0.1|bar|200, 300|1001/1002|

After exporting the above data to Lua, the output is

```lua
return {
	{"UID", },
	{"id", "bool_data", "int_data", "float_data", "string_data", "arr_data", "dic_data"},
	{1, true, 100, 1.2, "foo", {1001, 1002}, {id = 1001, num = 1002}},
	{2, false, 200, 0.1, "bar", {200, 300}, {id = 1001, num = 1002}}
}
```

### Constant Worksheet

We may need some systematic constant data, which will be exported in this table when we define an Excel page tab ending with the `consts` keyword:

The constant table data definition contains 4 columns.

- Name, the name of the constant field.
- Type, the field type.
- Value, the value of the field.
- Describe, field description.

The example format is.

|Name|Type|Value|Describe|
|---|---|---|---|
|TEST_BOOLEAN|bool|true|Floating point|
|TEST_STRING|string|hello|String constants|
|TEST_INTEGER|int|1|Integer constants|
|TEST_FLOAT|float|1.2|Floating-point constants|
|TEST_ARRAY|[int]|1, 2, 3, 4, 5|Array constants|
|TEST_MAP|{a=int,b=int,c=int}|1/2/3|Dictionary constants|

The export produces an output file, such as the output Lua file format.

``` lua
return {
	TEST_BOOLEAN = true,
	TEST_STRING = "hello",
	TEST_INTEGER = 1,
	TEST_FLOAT = 1.2,
	TEST_ARRAY = {1, 2, 3, 4, 5},
	TEST_MAP = {a = 1, b = 2, c = 3}
}
```

### Comments

Use `#` to mark.

- `Field type`, the data for that column will not be exported.
- `Excel page signature`, the data for that page signature will not be exported.