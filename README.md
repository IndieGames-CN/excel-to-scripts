# Excel 导出为脚本工具

## 快速开始

打包工程

```
npm run pkgwin
```



## 表格格式

单个 Excel 支持多个 Sheet 工作表，工作表类型分为两种：

- 普通工作表
- 常量工作表

### 普通工作表

普通工作表是传统的 Excel 配置，工作表分为表头行（占用4行）和内容行。

### 表头

表头分为4行：

- 第一行注释名称
- 第二行字段名称
- 第三行数据字段类型
- 第四行为保留行（其他高级功能）

### 数据类型描述

- bool，布尔型（0=false，1=true）
- int，整形
- float，浮点型
- string，字符串
- [int]，数组
  - [[int]]，二维数组
  - [{id=int,num=int}]，字典数组
- {id=int,num=int}，字典
  - {id=int,nums=[int]}，字典数组
  - {id=int,nums=[[int]]}，字典二维数组

#### 工作表格式举例

|UID|Describe||||||Two-dimensional arrays|Array Dictionary|
|---|---|---|---|---|---|---|---|---|
|id||bool_data|int_data|float_data|string_data|arr_data|arr2_data|arr3_data|dic_data|
|int|#|bool|int|float|string|[int]|[[int]]|[{id=int,num=int}]|{id=int,num=int}|
|unique||||||||||
|1|a|1|100|1.2|foo|1001, 1002|1,2|3,4|5,6|1/2|3/4|1001/1002|
|2|b|0|200|0.1|bar|200, 300|2,4|7|5/6|7/8|1001/1002|




### 常量工作表

表明页签以 `consts` 结尾，此表分类 4 列：

- Name，常量字段名称
- Type，字段类型
- Value，字段值
- Describe，字段描述

举例格式为：

|  Name | Type | Value | Describe |
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