var BackToLifeContract = artifacts.require("./BackToLife.sol");
var StringUtilities = artifacts.require("./strings.sol");


var fs = require('fs');

var writeToFile = function (content){
    fs.writeFile("../contractBackToLife.json", JSON.stringify(content), function(err) {
        if(err) {
            return console.log(err);
        }
    });
};


module.exports = function(deployer) {
    writeToFile();

    deployer.deploy(StringUtilities);
    deployer.link(StringUtilities, BackToLifeContract);

    return deployer.deploy(BackToLifeContract).then(function(tx){
        writeToFile({address: BackToLifeContract.address, abi: BackToLifeContract.abi});
    });
};