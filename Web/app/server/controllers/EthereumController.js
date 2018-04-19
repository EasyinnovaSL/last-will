var Web3 = require('web3');
var fs = require('fs');
var web3;
var contract;

var abi = "";
var contractAddress = "";

// Read contract info
fs.readFile("contract.json", 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    abi = config.abi;
    contractAddress = config.address;
});

function contract_init(address) {

    web3 = new Web3(new Web3.providers.HttpProvider(host));
    contract = web3.eth.contract(abi).at(contractAddress);

    try {
        web3.eth.defaultAccount = web3.eth.accounts[0];
        if (address != null) web3.eth.defaultAccount = address;
    } catch (ex) {
        console.log("Ethereum is not running");
        return false;
    }

    return true;
}

/**
 * Adds a key part to the Smart Contract
 */
exports.addHierarchy = function (address, friendAddress, keyPart, order) {
    if (!contract_init(address)) return false;

    try {
        contract.addHierarchy(address, friendAddress, keyPart, order, {gas: 3000000});
    } catch(ex) {
        return false;
    }

    return true;
};

/**
 * Get number of hierarchy users
 */
exports.getNumberHierarchyUsers = function (address) {
    if (!contract_init(address)) return false;

    return contract.getNumberHierarchyUsers.call();
};

/**
 * Get number of hierarchy users
 */
exports.getMyKeyPart = function (address, ownerAddress) {
    if (!contract_init(address)) return false;

    var result = contract.getMyKeyPart.call(ownerAddress);

    return {
        key: result[0],
        index: result[1],
    }
};

/**
 * Add a restored key part
 */
exports.addRestoreKey = function (address, oldOwnerAddress, newOwnerAddress, keyPart, index) {
    if (!contract_init(address)) return false;

    try {
        contract.addRestoreKey(oldOwnerAddress, newOwnerAddress, keyPart, index, {gas: 3000000});
    } catch(ex) {
        return false;
    }

    return true;
};

/**
 * Get restored key parts
 */
exports.getFullKey = function (address, newAddress) {
    if (!contract_init(address)) return false;

    var parts = contract.getFullKey.call(newAddress);

    return parts;
};