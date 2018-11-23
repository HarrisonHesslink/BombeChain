var express = require('express')
var program = require('commander');
var readline = require('readline');
var peer2peer = require('../p2p/p2p')
var daemon = require('../daemon/daemon')
const config = require('../config.json')

program
  .version('1.0.0')
  .option('-p, --port [port]', 'Set Port')
  .option('-phttp, --porthttp [port]', 'Set HTTP Port')
  .parse(process.argv);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
if (program.port){
  peer2peer.CreateMyPeer(program.port);
}else{
  peer2peer.CreateMyPeer(config.port);
}
