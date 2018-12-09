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

var levelup = require('levelup')
var leveldown = require('leveldown')
var blocks = require('../main_chain/blocks')

let database;
async function createDatabase(name) {
  console.log(name)
  db = levelup(leveldown('./' + name));
  database = db
}
async function writeToDatabase(block) {
  database.open();
  if (database) {
    database.put(block.index.toString(), JSON.stringify(block), function(err) {
      if (err) return console.log('Ooops!', err) // some kind of I/O error
      addBlock(block)
    })
  }
  database.close();
}
async function readDatabase(index) {
  database.open();

  if (database) {
    database.get(index, {
      asBuffer: false
    }, function(err, value) {
      if (err) return false; // likely the key was not found
      console.log(value)
      return value;
    })
  }
}
async function exitDatabase() {
  database.close();
}
async function getAllBlocks() {
  database.open();
  await database.createReadStream()
    .on('data', function(data) {
      let bufferOne = Buffer.from(data.value);
      let json = JSON.parse(bufferOne);

      addBlock(json)
    })
    .on('error', function(err) {
      console.log('Oh my!', err)
    })
    .on('close', function() {
      console.log('Stream closed')
    })
    .on('end', function() {
      console.log('Stream ended')
    })

}
async function addBlock(blk) {
  blocks.push(blk)
}
async function returnBlocks() {
  return blocks;
}
module.exports = {
  createDatabase,
  writeToDatabase,
  readDatabase,
  getAllBlocks,
  returnBlocks
}