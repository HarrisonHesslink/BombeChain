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

var sha256 = require('js-sha256');
var EdDSA = require('elliptic').eddsa;
var crypto = require("crypto");

var ec = new EdDSA('ed25519');
var _tx = require("./transaction.js")

function createGenesisTransaction(amount, address) {
  var id = crypto.randomBytes(64).toString('hex');
  var type = "coinbase";
  var outs = {
    "outputs": [{
      "amount": amount,
      "address": address
    }]
  }
  var ins = []
  var hash = sha256(Buffer.from(id, 'hex') + ins + outs);

  var tx = new _tx(id, hash, type, Date.now(), ins, outs);
  return tx;
}

module.exports = {
  createGenesisTransaction
}