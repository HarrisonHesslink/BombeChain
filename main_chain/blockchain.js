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

const Block = require("./block")
const transaction = require("../transactions/transactions")
const config = require('../config.json')
var sha256 = require('js-sha256');
var chain_mech = require('./chain_mechanics')
let _p2p = require('../p2p/p2p.js');
let logger = require('../logger/logger');
var blocks = require('./blocks')
var senators = require('../p2p/senators');


//Our way to currently add to the block chain by calling proposeBlock then "any address"
async function proposeBlock(address) {
  //Check if genesis
  if (blocks.length == 0) {
    const index = 0;
    const previousHash = "";
    const timestamp = Date.now();
    //Add Genesis TX
    const transactions = [

      transaction.createGenesisTransaction(config.premine, address)

    ];
    var proposer = address;
    var hash = sha256(index + previousHash + timestamp + transactions + proposer);
    var block = new Block(index, previousHash, timestamp, transactions, config.premine, hash, proposer, senators);
    logger.logMessage("INFO", "BLOCK PROPOSED: " + hash);
    //Notify the peers of the new block
    notifyPeers(block);
    //Add to chain
    chain_mech.addBlock(block, true);
  } else {
    //Get Last Block for prev hash and current supply
    const lastBlock = new Promise((resolve, reject) => {
      resolve(getTopBlock())
    });
    lastBlock.then(value => {
      var index = value.index + 1;
      const reward = config.maxSupply - value.currentSupply >> 20;
      const timestamp = Date.now();
      const previousHash = value.hash;
      const transactions = [];
      var proposer = address;
      var hash = sha256(index + previousHash + timestamp + transactions + proposer);
      var block = new Block(index, previousHash, timestamp, transactions, value.currentSupply + reward, hash, proposer, senators);
      logger.logMessage("INFO", "BLOCK PROPOSED: " + hash);
      //Add to chain
      chain_mech.addBlock(block, true);
      //Notify the peers of the new block
      notifyPeers(block);

    })
  }
}
async function exitDatabase() {
  await chain_mech.exitDatabase();
}
//TODO validate block further
async function isBlockValid(newBlock, lastBlock) {
  //  if (newBlock.previousHash!+)
}

// function startRound() {
//
// }
//
// function endRound() {
//
// }
//
// function voteOnBlock() {
//
// }

//Notify Peers of Blocks
function notifyPeers(blk) {
  _p2p.sendBlock(blk);
}

//Get Current Supply from last block
function getCurrentSupply() {
  return getTopBlock().currentSupply;
}
//TODO just use chain_mechanics last block.
async function getTopBlock() {
  var blks = await chain_mech.getDatabase();
  return blks[blks.length - 1]
}

module.exports = {
  proposeBlock,
  getTopBlock,
  exitDatabase
}