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

var readline = require('readline');
var p2p = require('../p2p/p2p.js')
var blockchain = require('../main_chain/blockchain')
let logger = require('../logger/logger');
let wallet = require('../wallet/wallet')
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

rl.on('line', function(line, lineCount, byteCount) {
  if (line == "get_status") {
    p2p.getStatus();
  } else if (line == "getKnownPeers") {
    p2p.knownPeers();
  } else if (line == "exit") {
    blockchain.exitDatabase();
    process.exit()
  } else if (line == "getLastBlock") {
    const lastBlock = new Promise((resolve, reject) => {
      resolve(blockchain.getTopBlock())
    });
    lastBlock.then(value => {
      console.log(value)
    })
  } else if (line == "proposeBlock" || line == "proposeblock") {
    rl.question("You are the proposer please enter address: ", function(answer) {
      blockchain.proposeBlock(answer)
    });
  } else if (line == "createWallet") {
    var w = new wallet();
    w.createWallet();
  } else {

  }
})