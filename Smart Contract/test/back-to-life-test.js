var BackToLife = artifacts.require("./BackToLife.sol");
var MyWill = artifacts.require("./MyWill.sol");

contract('BackToLife', function(accounts) {

    var service = accounts[0];
    var owner = accounts[1];
    var witness = accounts[2];

    var heirs = [accounts[3], accounts[4]];
    var heirsPercentages = ["30000", "70000"];

    var BackToLifeContractInstance;
    var MyWillInstance;

    it("Create My Will", async function() {

        BackToLifeContractInstance = await BackToLife.deployed();

        // Create My Will contract
        await BackToLifeContractInstance.createLastWill(owner, heirs.join(";"), heirsPercentages.join(";"), witness, {from: service});
        var result = await BackToLifeContractInstance.getContracts.call(owner, {from: service});
        var myWilLAddress = result.valueOf().split(';')[0];

        // Check contract creation
        if (myWilLAddress === "") {
            assert.equal(true, false, "Contract has not been created");
        }

        MyWillInstance = await MyWill.at(myWilLAddress);
        var balance = await MyWillInstance.getBalance.call();
        assert.equal(balance.valueOf(), 0, "The Smart Contract Balance is incorrect");
    });

    it("Send Ether", async function() {

        // Send some ether (it will fail)
        try {
            await MyWillInstance.send(web3.toWei(0.0001,"ether"), {from: owner});
            assert.equal(true, false, "The Smart Contract can receive too small amount of ether");
        } catch (ex) {

        }

        // Send some ether
        await MyWillInstance.send(web3.toWei(100,"ether"), {from: owner});
        var balance = await MyWillInstance.getBalance.call();
        var expected = 100 - 0.001 - 0.005; // 0.001 for 1 witness + 0.005 for the club (creation of smart contract)
        assert.equal(balance.valueOf(), web3.toWei(expected,"ether"), "The Smart Contract cannot receive ether");
    });

    it("Owner Died from heir", async function() {

        // Owner Died
        try{
            await MyWillInstance.ownerDied({from: heirs[0]});
            assert.equal(true, false, "The heir can execute owner died");
        } catch(ex){ }

        // Owner Died
        try{
            await MyWillInstance.ownerDied({from: heirs[1]});
            assert.equal(true, false, "The heir can execute owner died");
        } catch(ex){ }

    });

    it("Owner Died", async function() {

        var heir1Balance = await web3.eth.getBalance(heirs[0]);
        var heir2Balance = await web3.eth.getBalance(heirs[1]);

        // Owner Died
        await MyWillInstance.ownerDied({from: witness});

        // Check balance 0
        var balance = await MyWillInstance.getBalance.call();
        assert.equal(balance.valueOf(), 0, "The dead execution failed");

        // Check heir 30% balance
        balance = await web3.eth.getBalance(heirs[0]);
        var difference = balance.valueOf() - heir1Balance;
        assert.equal(true, difference > web3.toWei(29,"ether") && difference < web3.toWei(31,"ether"), "Heir 30% don't receive funds");

        // Check heir 70% balance
        balance = await web3.eth.getBalance(heirs[1]);
        difference = balance.valueOf() - heir2Balance;
        assert.equal(true, difference > web3.toWei(69,"ether") && difference < web3.toWei(71,"ether"), "Heir 70% don't receive funds");

    });

    it("Deny Transfer when dead", async function() {

        // Check smart contract deny ether transfers
        try {
            await MyWillInstance.send(web3.toWei(10,"ether"));
            assert.equal(true, false, "The smart contract accepts funds after death");
        } catch (ex) {
            assert.equal(true, true, "");
        }
    });

});