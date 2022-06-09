#!/usr/bin/env node

// node ./bin/index.js -i ./data -o ./output -f 普通工作表示例.xlsx

const fs = require("fs");
const path = require("path");
const yargs = require('yargs');
const exporters = require("../libs/exporters")

var argv = yargs
    .option('i', {
        alias: 'src_dir',
        demand: true,
        describe: 'source dir',
        type: 'string'
    })
    .option('o', {
        alias: 'out_dir',
        demand: true,
        describe: 'output dir',
        type: 'string'
    })
    .option('t', {
        alias: 'type',
        demand: true,
        default: "lua",
        describe: 'output type: lua, json, cs.',
        type: 'string'
    })
    .option('f', {
        alias: 'file',
        demand: true,
        default: 'all',
        describe: 'file name',
        type: 'string'
    })
    .usage('Usage: excel-exporter [options]')
    .example('excel-exporter -i ./data -o ./export -t lua Test.xlsx')
    .help('h')
    .alias('h', 'help')
    .argv;

console.log(argv)

if (argv.f == 'all') {
    
} else {
    exporters.exportSheets(argv.t, path.join(argv.i, argv.f), argv.o);
}