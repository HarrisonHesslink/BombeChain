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
var contenderBlocks = []
var altChainBlocks = []
//Adds Block to chain_mech
// Must Be validated by newBlock.previousHash == lastBlock.hash
//Currently being called twice for proposer
async function addBlock(block, created) {
  const lastBlock = new Promise((resolve, reject) => {
    resolve(getTopBlock())
  });
  lastBlock.then(value => {
    logger.logMessage("INFO", "Verifying BLOCK INDEX: " + block.index)
    if (!created && block.index != 0) {
      if (value) {
        if (block.previousHash == blocks[blocks.length - 1].hash) {
          blocks.push(block);
          database.writeToDatabase(block);
          logger.logMessage("INFO", "Added Block: " + block.hash)
        } else {
          logger.logMessage("DEBUG", "BLOCK INDEX: " + block.index)
          logger.logMessage("ERROR", "BLOCK IS NOT VALID! " + block.previousHash + " != " + value.hash)
        }
      }
    } else {
      blocks.push(block);
      database.writeToDatabase(block);
      logger.logMessage("INFO", "Added Block: " + block.hash)
    }
  })
}

async function addContenderBlock(block, created) {
  if (block.previousHash == '943837aa3e3b78ddc6d17eceffe7246e39fdd30e1edf734a73cad4e272be745b') {
    await addBlock(block, false);
  }
  if (contenderBlocks.some(e => e.proposer === block.proposer)) {
    return false;
  } else {
    const lastBlock = new Promise((resolve, reject) => {
      resolve(getTopBlock())
    });
    lastBlock.then(value => {
      if (!created && block.index > 0) {
        if (block.previousHash == value.hash) {
          contenderBlocks.push(block);
          logger.logMessage("INFO", "Added Block to Contender Pool: " + block.hash)
        }
      } else {
        logger.logMessage("ERROR", "BLOCK IS NOT VALID! " + block.previousHash + " != " + value.previousHash)
      }
    });
  }
}
async function addAltChain(blk, blkc) {
  altChainBlocks.push(blk);
  if (altChainBlocks.length == blkc) {
    var sorted = altChainBlocks.sort();
    console.log(sorted)
    for (var i = 0; i < sorted.length; i++) {
      addBlock(sorted[i], false);
    }
    sorted = []
    altChainBlocks = []
  }
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
async function createDatabase(name) {
  await database.createDatabase(name);
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
async function getContenderBlocks() {
  return contenderBlocks;
}
async function resetContenderBlocks() {
  contenderBlocks = []
}
module.exports = {
  addBlock,
  loadDatabase,
  getDatabase,
  getTopBlock,
  getBlock,
  exitDatabase,
  addContenderBlock,
  getContenderBlocks,
  resetContenderBlocks,
  addAltChain,
  createDatabase
}