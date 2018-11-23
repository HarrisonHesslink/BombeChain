const chalk = require("chalk");
function logMessage(type,message){
    if(type == "INFO"){
      console.log(chalk.yellow(message))
    }else if(type = "DEBUG"){
      console.log(chalk.green(message))
    }else if(type = "ERROR"){
      console.log(chalk.red(message))
    }else if(type = "MSG"){
      console.log(chalk.white(message))
    }
  }
module.exports ={logMessage};
