# Excel 导出为脚本工具

`Excel` 数据导出为脚本、高级编程语言工具。支持导出为 `Json`、`Lua`、`C#` 等脚本语言。

## 打包

```
$ git clone https://github.com/Veinin/excel-to-scripts.git
$ cd excel-to-scripts
$ npm run pkgwin
```

## 运行

启动 `excel-to-scripts` 执行文件，默认第一次运行会检测配置文件，如果没有则自动生成配置文件 `config.json`：

``` json
{
    "srcePath": "./data",
    "destPath": "./output"
}
```

其中 `srcePath` 为 Excel 文件目录，`destPath` 为数据导出目录。

启动执行文件后，执行导出流程：

- 1. 使用方向键上、下选择导出脚本类型
- 2. 使用方向键上、下选择导出文件，或直接输入选择数字
- 3. 按回车键执行

![Export](./docs/Export.gif)

## 表格格式

单个 Excel 支持多个 Sheet 工作表，工作表类型分为两种：

- 普通工作表，示例文件 [NormalWorksheet.xlsx](./data/NormalWorksheet.xlsx)
- 常量工作表，示例文件 [ConstantWorksheet.xlsx](./data/ConstantWorksheet.xlsx)

### 普通工作表

普通工作表是传统的 Excel 配置，工作表分为表头行（占用4行）和内容行。

#### 表头

表头分为4行：

- 第一行注释名称
- 第二行字段名称
- 第三行数据字段类型
- 第四行为保留行（其他高级功能）

#### 数据类型描述

- 基础数据类型
  - `bool`，布尔型（0=false，1=true）
  - `int`，整形
  - `float`，浮点型
  - `string`，字符串
- 集合类型，支持泛型
  - `[int]`，数组
    - `[[int]]`，二维数组
    - `[{id=int,num=int}]`，字典数组
  - `{id=int,num=int}`，字典
    - `{id=int,nums=[int]}`，字典数组
    - `{id=int,nums=[[int]]}`，字典二维数组
- 注释，#

#### 工作表格式举例

|UID|Describe|||||||
|---|---|---|---|---|---|---|---|
|id||bool_data|int_data|float_data|string_data|arr_data|dic_data|
|int|#|bool|int|float|string|[int]|{id=int,num=int}|
|unique||||||||
|1|a|1|100|1.2|foo|1001, 1002|1001/1002|
|2|b|0|200|0.1|bar|200, 300|1001/1002|

上面数据导出为 Lua 后，输出为：

```lua
return {
	{"UID", },
	{"id", "bool_data", "int_data", "float_data", "string_data", "arr_data", "dic_data"},
	{1, true, 100, 1.2, "foo", {1001, 1002}, {id = 1001, num = 1002}},
	{2, false, 200, 0.1, "bar", {200, 300}, {id = 1001, num = 1002}}
}
```

### 常量工作表

我们可能需要一些系统性的常量数据，当我们定义的 Excel 页页签以 `consts` 关键字结尾时，此表会当中常量数据导出:

- Name，常量字段名称
- Type，字段类型
- Value，字段值
- Describe，字段描述

举例格式为：

|Name|Type|Value|Describe|
|---|---|---|---|
|TEST_BOOLEAN|bool|true|Floating point|
|TEST_STRING|string|hello|String constants|
|TEST_INTEGER|int|1|Integer constants|
|TEST_FLOAT|float|1.2|Floating-point constants|
|TEST_ARRAY|[int]|1, 2, 3, 4, 5|Array constants|
|TEST_MAP|{a=int,b=int,c=int}|1/2/3|Dictionary constants|

导出后产生输出文件，如输出 Lua 文件格式：

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

### 注释

使用 `#` 标注：

- `字段类型`，该列数据不会导出。
- `Excel 页签名`，该页签数据不会导出。