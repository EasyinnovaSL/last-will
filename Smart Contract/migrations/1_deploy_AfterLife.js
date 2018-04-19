var AfterLifeContract = artifacts.require("./AfterLife.sol");

var fs = require('fs');

var writeToFile = function (content){
    fs.writeFile("../contract.json", JSON.stringify(content), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    fs.writeFile("../Web/contract.json", JSON.stringify(content), function(err) {
        if(err) {
            return console.log(err);
        }
    });
};

module.exports = function(deployer) {
    writeToFile();
    return deployer.deploy(AfterLifeContract).then(function(tx){
        writeToFile({address: AfterLifeContract.address, abi: AfterLifeContract.abi});
    });
};
