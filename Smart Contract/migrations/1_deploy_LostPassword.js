var AfterLifeContract = artifacts.require("./LostPassword.sol");

var fs = require('fs');

var writeToFile = function (content){
    fs.writeFile("../contractLostPassword.json", JSON.stringify(content), function(err) {
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
