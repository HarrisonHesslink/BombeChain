var blocks = require('./blocks')
let logger = require('../logger/logger')

function addBlock(block){
  blocks.push(block);
  logger.logMessage("INFO","Added Block: " + block.hash)
}

module.exports = {
  addBlock
}
