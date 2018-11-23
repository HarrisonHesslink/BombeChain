class Block {

  constructor(index,previousHash,timestamp,transactions,currentSupply,hash,proposer,senators){
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.currentSupply = currentSupply;
    this.hash = hash;
    this.proposer = proposer;
    this.senators = senators;
  }

  _getIndex(){
    return this.index;
  }
  _getPreviousHash(){
    return this.previousHash();
  }
  _getTimestamp(){
    return this.timestamp;
  }
  _getHash(){
    return this.hash;
  }
  _getCurrentSupply(){
    return this.getCurrentSupply;
  }
  _getSenators(){
    return this.senators;
  }

}
module.exports = Block;
