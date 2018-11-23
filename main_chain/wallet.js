var EC = require('elliptic').ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58')

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');
let logger = require('../logger/logger')

class Wallet{

  constructor(privkey,pubkey,amount,transactions){
    this.privkey = privkey;
    this.pubkey = pubkey;
    this.amount = amount;
    this.transactions = transactions;
  }
  createWallet(){
    var key = ec.genKeyPair();
    var pubKey = createPublicAddress(key.getPublic('hex'));



    console.log(pubKey);
    logger.logMessage("INFO","Private: " + key.priv)
    logger.logMessage("INFO","Public: " + pubKey)

  }

}
function createPublicAddress(publicKeyHash) {
  const step1 = Buffer.from("01" + publicKeyHash, 'hex');
  const step2 = sha256(step1);
  const step3 = sha256(Buffer.from(step2, 'hex'));
  const checksum = step3.substring(0, 8);
  const step4 = step1.toString('hex') + checksum;
  const address = base58.encode(Buffer.from(step4, 'hex'));
  return address;
}
module.exports = Wallet;
