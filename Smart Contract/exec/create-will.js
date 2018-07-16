var BackToLife = artifacts.require("./BackToLife.sol");
var MyWill = artifacts.require("./MyWill.sol");

module.exports = async function(callback) {

    web3.eth.getAccounts(async function(err, accounts) {
        var uniqueAccount = accounts[0];

        var service = uniqueAccount;
        var owner = uniqueAccount;
        var witness = uniqueAccount;

        var heirs = [uniqueAccount];
        var heirsPercentages = ["100000"];

        var BackToLifeContractInstance = await BackToLife.deployed();
        var result = await BackToLifeContractInstance.createLastWill(owner, heirs.join(";"), heirsPercentages.join(";"), witness, 5000000000, 1800000, {from: service});
        console.log("Gas cost: " + result.receipt.gasUsed);
        result = await BackToLifeContractInstance.getContracts.call(owner, {from: service});
        var strAddresses = result.valueOf();
        if (strAddresses.valueOf().endsWith(";")) {
            strAddresses = strAddresses.slice(0, -1);
        }
        var myWillAddresses = strAddresses.split(';');
        var myWillAddress = myWillAddresses[myWillAddresses.length -1];

        console.log("Owner: " + owner);
        console.log("Last Will Address: " + myWillAddress);

    });

};