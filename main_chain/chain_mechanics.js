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

var blocks = require('./blocks')
let logger = require('../logger/logger')
var database = require('../db/database')


//Adds Block to chain_mech
// Must Be validated by newBlock.previousHash == lastBlock.hash
//Currently being called twice for proposer
function addBlock(block, created) {
  const lastBlock = new Promise((resolve, reject) => {
    resolve(getTopBlock())
  });
  console.log(created)
  lastBlock.then(value => {
    if (!created && block.index != 1) {

      if (block.previousHash == value.hash) {
        blocks.push(block);
        database.writeToDatabase(block);
        logger.logMessage("INFO", "Added Block: " + block.hash)
      } else {
        logger.logMessage("ERROR", "BLOCK IS NOT VALID! " + block.previousHash + " != " + value.previousHash)
      }
    } else {
      blocks.push(block);
      database.writeToDatabase(block);
      logger.logMessage("INFO", "Added Block: " + block.hash)
    }
  })
}
async function exitDatabase() {
  await database.exitDatabase();
}
//Get Top Block
async function getTopBlock() {
  var blks = await getDatabase();
  return blks[blks.length - 1]
}
//get Block at index
async function getBlock(index) {
  var blks = await getDatabase();
  return blks[index]
}

//load persistant data into array
async function loadDatabase() {
  await database.getAllBlocks();
}
//allow easy access to blks
async function getDatabase() {
  var blks = await database.returnBlocks();
  return blks
}
module.exports = {
  addBlock,
  loadDatabase,
  getDatabase,
  getTopBlock,
  getBlock,
  exitDatabase
}