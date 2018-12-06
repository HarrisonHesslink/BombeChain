// Copyright Harrison Hesslink 2018-2019
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var express = require('express')
var program = require('commander');
var readline = require('readline');
var peer2peer = require('../p2p/p2p')
var daemon = require('../daemon/daemon')
const config = require('../config.json')
let database = require('../db/database')
let databaseName = ""

program
  .version('1.0.0')
  .option('-p, --port [port]', 'Set Port')
  .option('-phttp, --porthttp [port]', 'Set HTTP Port')
  .option('-db, --db [name]', 'Set DB Name')
  .parse(process.argv);
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});
if (program.db) {
  database.createDatabase(program.db);
} else {
  database.createDatabase("database");
}
if (program.port) {
  peer2peer.CreateMyPeer(program.port);
} else {
  peer2peer.CreateMyPeer(config.port);
}