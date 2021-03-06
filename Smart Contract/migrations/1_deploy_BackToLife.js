var BackToLifeContract = artifacts.require("./BackToLife.sol");
var MyWillContract = artifacts.require("./MyWill.sol");

var fs = require('fs');

var writeToFile = function (name, content = ""){
    fs.writeFileSync(name, JSON.stringify(content));
};


module.exports = function(deployer) {
    writeToFile("../contractBackToLife.json");
    writeToFile("../contractMyWill.json");

    return deployer.deploy(BackToLifeContract).then(function(tx){
        writeToFile("../contractBackToLife.json", {address: BackToLifeContract.address, abi: BackToLifeContract.abi});
        writeToFile("../contractMyWill.json", {abi: MyWillContract.abi});
    });
};