var readline = require('readline');
var p2p = require('../p2p/p2p.js')
var blockchain = require('../main_chain/blockchain')
var wallet = require('../main_chain/wallet')
let logger = require('../logger/logger');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

rl.on('line', function(line, lineCount, byteCount) {
  if(line == "get_status"){
    p2p.getStatus();
  }else if(line == "get_known_peers"){
    p2p.knownPeers();
  }else if(line == "get_last_block"){
    logger.logMessage("INFO",blockchain.getTopBlock().hash);
  }else if(line == "proposeBlock"){
    rl.question("You are the proposer please enter address: ", function(answer) {

    blockchain.proposeBlock(answer)
  });
  }else if(line == "createWallet"){
    var w = new wallet();
    w.createWallet();
  }else{

  }
  })
