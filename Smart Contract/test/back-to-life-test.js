var BackToLife = artifacts.require("./BackToLife.sol");

contract('BackToLife', function(accounts) {
    var sender = accounts[0];

    it("BackToLife Create Accounts", function() {
        var BackToLifeContractInstance;

        return BackToLife.deployed().then(function (instance) {
            BackToLifeContractInstance = instance;
        }).then(function () {

            return BackToLifeContractInstance.createHierarchyContract("0xf1f42f995046e67b79dd5ebafd224ce964740da3;0x2052d46d53107b0384503be3a11935f0b5cd5342", "50;50");

            //BackToLifeContractInstance.addHeirs();

        }).then(function () {

            return BackToLifeContractInstance.getMyContracts.call();

        }).then(function (result) {

            assert.equal(result.valueOf(), 0x01, "The byte representation is incorrect");

        });
    });
});