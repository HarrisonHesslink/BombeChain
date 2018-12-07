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

var EC = require('elliptic').ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58')

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

class Wallet {

  constructor(privkey, pubkey, amount, transactions) {
    this.privkey = privkey;
    this.pubkey = pubkey;
    this.amount = amount;
    this.transactions = transactions;
  }
  createWallet() {
    var key = ec.genKeyPair();
    var pubKey = createPublicAddress(key.getPublic('hex'));
    console.log(pubKey);
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