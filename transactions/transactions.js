var sha256 = require('js-sha256');
var EdDSA = require('elliptic').eddsa;
var crypto = require("crypto");

var ec = new EdDSA('ed25519');
var _tx = require("./transaction.js")
console.log(_tx)
function createGenesisTransaction(amount,address){
  var id = crypto.randomBytes(64).toString('hex');
  var type = "coinbase";
  var outs = {
    "outputs":[
      {
        "amount":amount,
        "address":address
      }
    ]
  }
  var ins = []
  var hash = sha256(Buffer.from(id, 'hex') + ins + outs);

  var tx = new _tx(id,hash,type,Date.now(),ins,outs);
  return tx;
}

module.exports = {
  createGenesisTransaction
}
