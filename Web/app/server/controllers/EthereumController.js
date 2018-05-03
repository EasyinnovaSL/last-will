var Web3 = require('web3');
var fs = require('fs');
var web3;
var contract;

var abi = "";
var contractAddress = "";

var host = "http://localhost:9595";

// Read contract info
fs.readFile("../contractLostPassword.json", 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    abi = config.abi;
    contractAddress = config.address;
});

function contract_init(address) {

    try {
        web3 = new Web3(new Web3.providers.HttpProvider(host));
        contract = web3.eth.contract(abi).at(contractAddress);

        web3.eth.defaultAccount = web3.eth.accounts[0];
        if (address != null) web3.eth.defaultAccount = address;
    } catch (ex) {
        console.log("Ethereum is not running: " + ex.message);
        return false;
    }

    return true;
}

/**
 * Adds a key part to the Smart Contract
 */
exports.addHierarchy = function (address, friendAddress, keyPart, order, keyName) {
    if (!contract_init(address)) return false;

    try {
        contract.addHierarchy(friendAddress, keyPart, order, keyName, {gas: 3000000});
    } catch(ex) {
        console.log("Error addHierarchy: " + ex.message);
        return false;
    }

    return true;
};

/**
 * Get number of hierarchy users
 */
exports.getNumberHierarchyUsers = function (address, keyName) {
    if (!contract_init(address)) return false;

    return parseInt(contract.getNumberHierarchyUsers.call(keyName));
};

/**
 * Get number of hierarchy users
 */
exports.getMyKeyPart = function (address, ownerAddress, keyName) {
    if (!contract_init(address)) return false;

    var result = contract.getMyKeyPart.call(ownerAddress, keyName);

    return {
        key: result[0],
        index: parseInt(result[1]),
    }
};

/**
 * Add a restored key part
 */
exports.addRestoreKey = function (address, oldOwnerAddress, newOwnerAddress, keyPart, index, keyName) {
    if (!contract_init(address)) return false;

    try {
        contract.addRestoreKey(oldOwnerAddress, newOwnerAddress, keyPart, index, keyName, {gas: 3000000});
    } catch(ex) {
        return false;
    }

    return true;
};

/**
 * Get restored key parts
 */
exports.getFullKey = function (address, newAddress, keyName) {
    if (!contract_init(address)) return false;

    var parts = contract.getFullKey.call(newAddress, keyName);

    return parts;
};