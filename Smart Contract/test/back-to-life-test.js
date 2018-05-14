var BackToLife = artifacts.require("./BackToLife.sol");
var HierarchyContract = artifacts.require("./HierarchyContract.sol");

contract('BackToLife', function(accounts) {
    console.log(accounts);
    var sender = accounts[0];
    console.log("Sender Account: " + sender);

    it("BackToLife Create Accounts", function() {
        var BackToLifeContractInstance;
        var  instanceHierarchyContract;

        return BackToLife.deployed().then(function (instance) {
            BackToLifeContractInstance = instance;
        }).then(function (result) {

            //assert.equal(result.valueOf(), 150, "Balance Is Incorrect");

            //return BackToLifeContractInstance.createHierarchyContract("0xf1f42f995046e67b79dd5ebafd224ce964740da3;0x2052d46d53107b0384503be3a11935f0b5cd5342", "11;89", "0xf1f42f995046e67b79dd5ebafd224ce964740da3;0x2052d46d53107b0384503be3a11935f0b5cd5342");
            return BackToLifeContractInstance.createHierarchyContractPayable("0xca3174f4c90013d29e8a24bd7cc4efb2d0ee5958;0x62644862009ce35e5260ed9b28db0b7b03561784", "11;89", "0xca3174f4c90013d29e8a24bd7cc4efb2d0ee5958;0x62644862009ce35e5260ed9b28db0b7b03561784", {value: web3.toWei(10, "ether")});

        }).then(function () {

            return BackToLifeContractInstance.getMyContracts.call();

        }).then(function (result) {

            var contractAddress = result.valueOf().replace(';','');

            instanceHierarchyContract = HierarchyContract.at(contractAddress);

            //instanceHierarchyContract.send({from: "0xff1fbfe19950b12ace5101de1459d765e062cb59", value: 1});


            return instanceHierarchyContract.getBalance.call();

        }).then(function (result) {

            assert.equal(result.valueOf(), 10000000000000000000, "The Smart Contract Balance is incorrect");

            //return instanceHierarchyContract.getPercentage.call();

        }).then(function () {

            //assert.equal(result.valueOf(), 10000000000000000000, "The byte representation is incorrect");

            instanceHierarchyContract.ownerDied({from: "0xca3174f4c90013d29e8a24bd7cc4efb2d0ee5958"});

            return instanceHierarchyContract.getBalance.call({from: "0xca3174f4c90013d29e8a24bd7cc4efb2d0ee5958"});

        }).then(function (result) {

            //assert.equal(result.valueOf(), 10000000000000000000, "The Account Balance is incorrect");
            assert.equal(result.valueOf(), 10000000000000000000, "The Account Balance of 0xca3174f4c90013d29e8a24bd7cc4efb2d0ee5958 is incorrect");

            instanceHierarchyContract.ownerDied({from: "0x62644862009ce35e5260ed9b28db0b7b03561784"});

            return instanceHierarchyContract.getBalance.call({from: "0xff1fbfe19950b12ace5101de1459d765e062cb59"});

        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "The smart contract balance is incorrect");
            //assert.equal(true, true, "true");

        });
    });


});