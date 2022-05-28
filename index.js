#!/usr/bin/env node
process.argv = process.argv.slice(2);
require('./lib/cli.js')(process);
