const Block = require("./block")
const transaction = require("../transactions/transactions")
const config = require('../config.json')
var sha256 = require('js-sha256');
var chain_mech = require('./chain_mechanics')
let _p2p = require('../p2p/p2p.js');
let logger = require('../logger/logger');
var blocks = require('./blocks')
var senators = require('../p2p/senators');

console.log(_p2p)


async function proposeBlock(address){
  console.log(blocks.length)
  if(blocks.length == 0){
    const index = 0;
    const previousHash = "";
    const timestamp = Date.now();
    const transactions = [

      transaction.createGenesisTransaction(config.premine,address)

    ];
    var proposer = address;
    var hash = sha256(index + previousHash + timestamp + transactions + proposer);

    //RoundStart
    await _p2p.checkResumes();
    console.log(senators);


    var block = new Block(index,previousHash,timestamp,transactions,config.premine,hash,proposer,senators);
    logger.logMessage("INFO","BLOCK PROPOSED: " + hash);
    notifyPeers(block);
    chain_mech.addBlock(block);
  }else{
  var reward = config.maxSupply - getCurrentSupply() >> 20;
  var block = new Block();
 }
}
function startRound(){

}
function endRound(){

}
function voteOnBlock(){

}
function notifyPeers(blk){
  _p2p.sendBlock(blk);
}

function getCurrentSupply(){
  return getTopBlock._getCurrentSupply();
}

function getTopBlock(){
  return blocks[blocks.length-1];
}

module.exports = {
  proposeBlock, getTopBlock
}
