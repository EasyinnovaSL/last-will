var BackToLife = artifacts.require("./BackToLife.sol");
var MyWill = artifacts.require("./MyWill.sol");

module.exports = async function(callback) {

    web3.eth.getAccounts(async function(err, accounts) {
        var service = accounts[0];
        var owner = accounts[1];
        var witness = accounts[2];

        var heirs = [accounts[3], accounts[4]];
        var heirsPercentages = ["30000", "70000"];

        var BackToLifeContractInstance = await BackToLife.deployed();
        var result = await BackToLifeContractInstance.createLastWill(owner, heirs.join(";"), heirsPercentages.join(";"), witness, {from: service});
        console.log("Gas cost: " + result.receipt.gasUsed);
        result = await BackToLifeContractInstance.getContracts.call(owner, {from: service});
        var strAddresses = result.valueOf();
        if (strAddresses.valueOf().endsWith(";")) {
            strAddresses = strAddresses.slice(0, -1);
        }
        var myWillAddresses = strAddresses.split(';');
        var myWillAddress = myWillAddresses[myWillAddresses.length -1];

        // console.log("Owner: " + owner);
        // console.log("Address: " + myWillAddress);

    });

};