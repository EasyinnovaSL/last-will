var BackToLife = artifacts.require("./BackToLife.sol");
var HierarchyContract = artifacts.require("./HierarchyContract.sol");

module.exports = function(callback) {

    var BackToLifeContractInstance;
    var HierarchyContractInstance;

    return BackToLife.deployed().then(function (instance) {
        BackToLifeContractInstance = instance;
    }).then(function () {
        return BackToLifeContractInstance.createHierarchyContractPayable("0xc0Eb469a948C5b7A163Df6e9bCa0a7115a74B7a9;0xE9948052F6135eA10E12b64deBD2f0060143148A".toLowerCase(), "60;40", "0xc0Eb469a948C5b7A163Df6e9bCa0a7115a74B7a9;0xE9948052F6135eA10E12b64deBD2f0060143148A".toLowerCase(), {value: web3.toWei(10, "ether")});
    }).then(function (tx) {
        return BackToLifeContractInstance.getMyContracts.call();
    }).then(function (result) {
        var contracts = result.valueOf().slice(0, -1).split(";");
        var contractAddress = contracts[contracts.length-1];
        console.log("Contract address: " + contractAddress);
        HierarchyContractInstance = HierarchyContract.at(contractAddress);
        return HierarchyContractInstance.ownerDied({from: "0xc0Eb469a948C5b7A163Df6e9bCa0a7115a74B7a9".toLowerCase()});
    }).then(function (tx) {
        console.log("TX Hash: " + tx.tx);
    }).catch(function(err){
        console.error(err);
    });
};