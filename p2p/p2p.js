const p2p = require('p2p');
let logger = require('../logger/logger')
let chainMechanics = require('../main_chain/chain_mechanics')
const config = require('../config.json')
var this_peer;
var senator = require('./senator')
var senators = require('./senators');

function CreateMyPeer(port){
  this_peer = p2p.peer({
    host: 'localhost',
    port: port
  });
  loadSeedPeers(port);
  logger.logMessage("INFO","Listening to P2P Server: " + port);
  this_peer.handle.awaken = (payload,done)=>{
    if(payload.msg != ""){
      logger.logMessage("INFO",payload.msg)
      done(null,{msg:"Yes I am awake!",peer:this_peer})
    }
  }
  this_peer.handle.sendBlock = (payload,done)=>{
    if(payload.msg != ""){
      logger.logMessage("INFO",payload.msg)
      console.log(payload.block)
      chainMechanics.addBlock(payload.block);
    }
  }
  this_peer.handle.checkResume = (payload,done)=>{
    if(payload.msg != ""){
      //TODO CHECK Resume
      logger.logMessage("INFO",payload.msg)
      done(null,{peer_id:this_peer.self.id})
    }
  }
}
//Load Seed Peers First
function loadSeedPeers(port){
  for(var i = 0; i < config.seed_nodes.length;i++){
    if(config.seed_nodes[i].port != port){
    this_peer.remote({
      host: config.seed_nodes[i].host,
      port: config.seed_nodes[i].port
    }).run('handle/awaken',{msg:"Are you awake?"},(err,result)=> {
      if(result.msg != "undefined"){
      if(result.msg == "Yes I am awake!"){
       createPeer(result.peer.self.host,result.peer.self.port);
      }
    }
    });
  }
  }
}
function sendBlock(blk){
  var knownPeers = this_peer.wellKnownPeers.get();

  for(var i = 0;i < knownPeers.length;i++){
  this_peer.remote({
    host: knownPeers[i].host,
    port: knownPeers[i].port
  }).run('handle/sendBlock',{msg:"Incoming Proposed Block",block:blk},(err,result)=> {
    console.log(result)
  });
}
}
function knownPeers(){
  for(var i = 0;i < knownPeers.length;i++){
    this_peer.remote({
      host: config.seed_nodes[i].host,
      port: config.seed_nodes[i].port
    }).run('handle/checkResume',{msg:"Consensus is looking at your Resume for being picked for Senator."},(err,result)=> {

    });
  }
}

async function checkResumes(){
  var knownPeers = this_peer.wellKnownPeers.get();
  var list = [];
  for(var i = 0;i < knownPeers.length;i++){
  this_peer.remote({
    host: knownPeers[i].host,
    port: knownPeers[i].port
  }).run('handle/checkResume',{msg:"Consensus is looking at your Resume for being picked for Senator."},(err,result)=> {
    if(result){
      var new_senator = new senator(result.peer_id);
      list.push(new_senator);
      addSenator(new_senator);
    }
  });
}
console.log(list);
}
async function addSenator(senator){
  senators.push(senator);
}
function createPeer(ip,port){
  this_peer.wellKnownPeers.add({"host":ip,"port":port});
  logger.logMessage("INFO","Added Peer: IP: " + ip);
}
function banPeer(){

}
function getStatus(){
  logger.logMessage("INFO","PEER STATUS: " + this_peer.status())
}
module.exports = {
  CreateMyPeer,getStatus,knownPeers,sendBlock,checkResumes
}
