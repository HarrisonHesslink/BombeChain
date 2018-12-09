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
var randomNumber = require("random-number-csprng");
var current = 0;
var target = 30000;
//Our way to currently add to the block chain by calling proposeBlock then "any address"
async function proposeBlock(address, balance) {
  //Check if genesis
  if (blocks.length == 0) {
    const index = 0;
    const previousHash = "943837aa3e3b78ddc6d17eceffe7246e39fdd30e1edf734a73cad4e272be745b";
    const timestamp = Date.now();
    //Add Genesis TX
    const transactions = [

      transaction.createGenesisTransaction(config.premine, address)

    ];
    var proposer = address;
    var hash = sha256(index + previousHash + timestamp + transactions + proposer);
    var lastRound = Date.now();
    var block = new Block(index, previousHash, timestamp, transactions, config.premine, hash, proposer, 0, lastRound);
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
      var proposeBalance = parseInt(balance);
      var hash = sha256(index + previousHash + timestamp + transactions + proposer);
      var block = new Block(index, previousHash, timestamp, transactions, value.currentSupply + reward, hash, proposer, proposeBalance);
      logger.logMessage("INFO", "BLOCK PROPOSED: " + hash);
      //Add to chain
      notifyPeers(block);
      chain_mech.addContenderBlock(block, true);
      //Notify the peers of the new block

    })
  }
}

//This needs refactoring
async function pickWinner() {
  var contenderBlocks = await chain_mech.getContenderBlocks();
  const lastBlock = new Promise((resolve, reject) => {
    resolve(getTopBlock())
  });
  lastBlock.then(value => {
    if (Date.now() >= value.lastRound + 30000) {
      logger.logMessage("ERROR", "Picking Winner")

      var totalPool = 0;
      var tickets = [];
      if (contenderBlocks.length > 0) {
        for (var i = 0; i < contenderBlocks.length; i++) {
          for (var j = 0; j < contenderBlocks[i].proposerBal; j++) {
            tickets.push({
              proposer: contenderBlocks[i].proposer
            })
          }
        }
        var percent = parseInt(value.hash, 16) / Math.pow(2, 256);
        var tpp = percent * tickets.length;
        var winnerTicket = tickets.length - Math.trunc(tpp);
        for (var i = 0; i < contenderBlocks.length; i++) {
          if (tickets[winnerTicket].proposer == contenderBlocks[i].proposer) {
            logger.logMessage("INFO", "WINNER TICKET: " + contenderBlocks[i].proposer);
            var block = contenderBlocks[i];
            block.lastRound = Date.now();
            chain_mech.addBlock(contenderBlocks[i], false)
            notifyPeers_3(contenderBlocks[i]);
            chain_mech.resetContenderBlocks();
            current = block.lastRound;
            countdown()

          }
        }

      } else {
        logger.logMessage("ERROR", "NO BLOCKS FOR ROUND!!!")
      }
    } else {
      countdown(block.lastRound)
      logger.logMessage("ERROR", "NOT TIME YET!")

    }
  })
}

async function stake(address, amount) {
  proposeBlock(address, amount)
}
async function exitDatabase() {
  await chain_mech.exitDatabase();
}
//TODO validate block further
async function isBlockValid(newBlock, lastBlock) {}

//Notify Peers of Blocks
function notifyPeers(blk) {
  _p2p.sendBlock(blk);
}

function notifyPeers_2(blk) {
  _p2p.sendBlock_2(blk);
}

function notifyPeers_3(blk) {
  _p2p.sendBlock_3(blk);
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
async function countdown() {
  console.log(current)
  current += 1000;
  var diff = current - target + 30000;
  if (diff > 0) {
    setTimeout(countdown, 1000);
  } else {
    pickWinner();
  }
}


Array.prototype.shuffle = function(random) {
  var input = this;

  for (var i = input.length - 1; i >= 0; i--) {

    var randomIndex = Math.floor(random * (i + 1));
    var itemAtIndex = input[randomIndex];

    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
}
module.exports = {
  proposeBlock,
  getTopBlock,
  exitDatabase,
  stake,
  pickWinner
}