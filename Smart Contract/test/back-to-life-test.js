var BackToLife = artifacts.require("./BackToLife.sol");
var HierarchyContract = artifacts.require("./HierarchyContract.sol");

contract('BackToLife', function(accounts) {
    console.log(accounts);
    var sender = accounts[0];

    it("BackToLife Create Accounts", function() {
        var BackToLifeContractInstance;
        var  instanceHierarchyContract;

        return BackToLife.deployed().then(function (instance) {
            BackToLifeContractInstance = instance;
        }).then(function (result) {

            //assert.equal(result.valueOf(), 150, "Balance Is Incorrect");

            return BackToLifeContractInstance.createHierarchyContract("0xf1f42f995046e67b79dd5ebafd224ce964740da3;0x2052d46d53107b0384503be3a11935f0b5cd5342", "11;89");

            //BackToLifeContractInstance.addHeirs();

        }).then(function () {

            return BackToLifeContractInstance.getMyContracts.call();

        }).then(function (result) {


            var contractAddress = result.valueOf().replace(';','');

            instanceHierarchyContract = HierarchyContract.at(contractAddress);

            instanceHierarchyContract.send(web3.toWei(25, "ether"));

            return instanceHierarchyContract.getBalance.call();

        }).then(function (result) {

            return instanceHierarchyContract.getPercentage.call();

        }).then(function (result) {

            assert.equal(result.valueOf(), 10000000000000000000, "The byte representation is incorrect");

            instanceHierarchyContract.ownerDied({from: "0xf1f42f995046e67b79dd5ebafd224ce964740da3"});

            return instanceHierarchyContract.getBalance.call({from: "0xf1f42f995046e67b79dd5ebafd224ce964740da3"});

        }).then(function (result) {

            //assert.equal(result.valueOf(), 10000000000000000000, "The Account Balance is incorrect");
            assert.equal(result.valueOf(), 25000000000000000000, "The Account Balance is incorrect");


            return instanceHierarchyContract.ownerDied({from: "0x2052d46d53107b0384503be3a11935f0b5cd5342"});

        }).then(function () {

            return instanceHierarchyContract.getBalance.call();

        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "The byte representation is incorrect");

        });
    });
});