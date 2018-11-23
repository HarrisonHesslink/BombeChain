class Transaction {

  constructor(id,hash,type,timestamp,ins,outs){
    this.id = id;
    this.hash = hash;
    this.timestamp = timestamp;
    this.data = {
      inputs: ins,
      outputs: outs
    },
    this.type = type;
  }

  _getID(){
    return this.id;
  }
  _getHash(){
    return this.hash();
  }
  _getTimestamp(){
    return this.timestamp;
  }
  _getType(){
    return this.type;
  }
  _getData(){
    return this.data;
  }



}
module.exports = Transaction;
