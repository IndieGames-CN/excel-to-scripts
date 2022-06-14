#!/usr/bin/env node

const path = require("path");
const yargs = require('yargs');
const cmder = require("../libs/cmder")
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
    .option('c', {
        alias: 'cmd',
        demand: true,
        default: true,
        describe: 'comand line mode',
        type: 'bool'
    })
    .usage('Usage: excel-exporter [options]')
    .example('excel-exporter -i ./data -o ./export -t lua Test.xlsx')
    .help('h')
    .alias('h', 'help')
    .argv;

if (argv.cmd) {
    cmder.start(argv.i, argv.o)
} else {
    exporters.exportSheets(argv.t, path.join(argv.i, argv.f), argv.o);
}