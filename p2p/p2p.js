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


const p2p = require('p2p');
let logger = require('../logger/logger')
let chainMechanics = require('../main_chain/chain_mechanics')
const config = require('../config.json')
var this_peer;
var senator = require('./senator')
var senators = require('./senators');

//Creates Peer
function CreateMyPeer(port) {
  this_peer = p2p.peer({
    host: 'localhost',
    port: port
  });
  loadSeedPeers(port);
  logger.logMessage("INFO", "Listening to P2P Server: " + port);
  chainMechanics.loadDatabase()

  //Start of p2p handlers

  //Check if node is awake? If so send blockheight
  this_peer.handle.awaken = (payload, done) => {
    if (payload.msg != "") {
      logger.logMessage("INFO", payload.msg)
      createPeer(payload.peer.self.host, payload.peer.self.port);
      askForTopBlock(payload.peer.self.host, payload.peer.self.port)
      done(null, {
        msg: "Yes I am awake!",
        peer: this_peer
      })
    }
  }
  //Check if node is awake? Send new block

  this_peer.handle.sendBlock = (payload, done) => {
    if (payload.msg) {
      logger.logMessage("INFO", payload.msg)
      //console.log(payload.block)
      chainMechanics.addBlock(payload.block, false);
    }
  }
  this_peer.handle.checkResume = (payload, done) => {
    if (payload) {
      //TODO CHECK Resume
      logger.logMessage("INFO", payload.msg)
      done(null, {
        peer_id: this_peer.self.id
      })
    }
  }
  //Check if node is awake? Check Block Height if less request blocks from peer
  this_peer.handle.checkBlockHeight = (payload, done) => {
    if (payload) {
      console.log(payload.msg)
      const lastBlock = new Promise((resolve, reject) => {
        resolve(chainMechanics.getTopBlock())
      });
      lastBlock.then(value => {
        console.log(payload.blockIndex)
        console.log(value.index)
        if (value) {
          //console.log(value.index)
          if (value.index < payload.blockIndex) {
            requestBlocks(payload.blockIndex, value.index, payload.peer.self.host, payload.peer.self.port);
            done(null)
          }
        } else {
          requestBlocks(payload.blockIndex, 1, payload.peer.self.host, payload.peer.self.port);
          done(null)
        }
      })
    }
  }
  //Currently not used
  this_peer.handle.getSentBlock = (payload, done) => {
    if (payload) {
      console.log(payload.msg)
      const lastBlock = new Promise((resolve, reject) => {
        resolve(chainMechanics.getTopBlock())
      });

      lastBlock.then(value => {
        if (value) {

          if (payload.blockIndex > value.index) {
            console.log("Not Synced! " + value.index + "/" + payload.blockIndex)
            requestBlocks(payload.blockIndex, value.index, payload.peer.self.host, payload.peer.self.port);
            done(null)
          }
        } else if (!value) {
          requestBlocks(payload.blockIndex, 1, payload.peer.self.host, payload.peer.self.port);
          done(null)
        }
      })
    }
  }

  //send blocks to node which requested x block
  this_peer.handle.helpNode = (payload, done) => {
    if (payload) {
      const lastBlock = new Promise((resolve, reject) => {
        resolve(chainMechanics.getBlock(payload.blockRequested + 1))
      });
      lastBlock.then(value => {
        if (value) {
          sendBlock_2(value, payload.peer.self.host, payload.peer.self.port);
          logger.logMessage("INFO", "Sent Block:" + value.hash + " " + value.index)
          done(null)
        }

      })

    }
  }
}

//p2p functions to call to remote nodes

//Load Seed Peers First
function loadSeedPeers(port) {
  for (var i = 0; i < config.seed_nodes.length; i++) {
    if (config.seed_nodes[i].port != port) {
      this_peer.remote({
        host: config.seed_nodes[i].host,
        port: config.seed_nodes[i].port
      }).run('handle/awaken', {
        msg: "Are you awake?",
        peer: this_peer
      }, (err, result) => {
        if (result) {
          if (result.msg == "Yes I am awake!") {
            createPeer(result.peer.self.host, result.peer.self.port);
            askForTopBlock(result.peer.self.host, result.peer.self.port)
          }
        }
      });
    }
  }
}

//Ask for height
function askForTopBlock(host, port) {
  const lastBlock = new Promise((resolve, reject) => {
    resolve(chainMechanics.getTopBlock())
  });

  lastBlock.then(value => {
    var index = 0;
    if (value) {
      index = value.index;
      console.log(value.index)
    }

    this_peer.remote({
      host: host,
      port: port
    }).run('handle/checkBlockHeight', {
      msg: "Requesting Block Height!",
      blockIndex: index,
      peer: this_peer
    }, (err, result) => {
      if (result) {
        const lastBlock = new Promise((resolve, reject) => {
          resolve(chainMechanics.getTopBlock())
        });
        lastBlock.then(value => {
          //    if (value) sendTopBlock(this_peer.self.host, this_peer.self.port, value.index);
        });
      }
    });
  })
}
//Send top block (currently not used)
function sendTopBlock(host, port, index) {
  this_peer.remote({
    host: host,
    port: port
  }).run('handle/getSentBlock', {
    msg: "Requesting Block Height!",
    blockIndex: index,
    peer: this_peer
  }, (err, result) => {
    //console.log(result)
  });
}

//send nodes to all known peers
function sendBlock(blk) {
  var knownPeers = this_peer.wellKnownPeers.get();

  for (var i = 0; i < knownPeers.length; i++) {
    this_peer.remote({
      host: knownPeers[i].host,
      port: knownPeers[i].port
    }).run('handle/sendBlock', {
      msg: "Incoming Proposed Block",
      block: blk
    }, (err, result) => {
      //  console.log(result)
    });
  }
}

//Send Block to node who requested
function sendBlock_2(blk, host, port) {
  this_peer.remote({
    host: host,
    port: port
  }).run('handle/sendBlock', {
    msg: "Incoming Proposed Block",
    block: blk
  }, (err, result) => {
    //  console.log(result)
  });
}
//Request Blocks from a node
function requestBlocks(index, ourIndex, host, port) {
  for (var i = 0; i < index; i++) {
    this_peer.remote({
      host: host,
      port: port
    }).run('handle/helpNode', {
      blockRequested: ourIndex + i,
      peer: this_peer
    }, (err, result) => {
      //console.log(result);
    });
  }
}
//Not used
function knownPeers() {
  for (var i = 0; i < knownPeers.length; i++) {
    this_peer.remote({
      host: config.seed_nodes[i].host,
      port: config.seed_nodes[i].port
    }).run('handle/checkResume', {
      msg: "Consensus is looking at your Resume for being picked for Senator."
    }, (err, result) => {

    });
  }
}
//Not used
async function checkResumes() {
  var knownPeers = this_peer.wellKnownPeers.get();
  var list = [];
  for (var i = 0; i < knownPeers.length; i++) {
    this_peer.remote({
      host: knownPeers[i].host,
      port: knownPeers[i].port
    }).run('handle/checkResume', {
      msg: "Consensus is looking at your Resume for being picked for Senator."
    }, (err, result) => {
      if (result) {
        var new_senator = new senator(result.peer_id);
        list.push(new_senator);
        addSenator(new_senator);
      }
    });
  }
  //console.log(list);
}
async function addSenator(senator) {
  senators.push(senator);
}



function createPeer(ip, port) {
  this_peer.wellKnownPeers.add({
    "host": ip,
    "port": port
  });
  logger.logMessage("INFO", "Added Peer: IP: " + ip);
}

function banPeer() {

}

function getStatus() {
  logger.logMessage("INFO", "PEER STATUS: " + this_peer.status())
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
setInterval(function() {
  var knownPeers = this_peer.wellKnownPeers.get();
  askForTopBlock(knownPeers[getRandomInt(knownPeers.length)].host, knownPeers[getRandomInt(knownPeers.length)].port);
  console.log('Checking For Blocks');

}, 30000);
module.exports = {
  CreateMyPeer,
  getStatus,
  knownPeers,
  sendBlock,
  checkResumes
}