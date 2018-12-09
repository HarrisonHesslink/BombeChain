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

class Block {

  constructor(index, previousHash, timestamp, transactions, currentSupply, hash, proposer, proposeBalance, lastRound) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.currentSupply = currentSupply;
    this.hash = hash;
    this.proposer = proposer;
    this.proposerBal = proposeBalance;
    this.lastRound = lastRound;
  }

  _getIndex() {
    return this.index;
  }
  _getPreviousHash() {
    return this.previousHash();
  }
  _getTimestamp() {
    return this.timestamp;
  }
  _getHash() {
    return this.hash;
  }
  _getCurrentSupply() {
    return this.getCurrentSupply;
  }

  setOutcome(outcome) {
    this.outcome = outcome;
  }

}
module.exports = Block;