var EasyCrypto = require('easy-eth-crypto');

/**
 * Save your password into the Blockchain
 */
exports.savePassword = function (req, res) {
    if (req.body.password && req.body.keys) {
        var password = req.body.password;
        var keys = req.body.keys.split(";");
        if (password.length < 20) {
            return res.status(400).json({message: "Password too small. Minimum 20 characters."});
        }

        // Each Public Key
        for (var publicKey of keys) {

        }

        return res.status(200).json({result: "You are the best, remind your password ;)"});
    }
    return res.status(400).json({message: "Invalid parameters"});
};

/**
 * Recover your password from the Blockchain
 */
exports.recoverPassword = function (req, res) {
    if (req.body.lostAddress && req.body.newPublicKey) {
        var myPublicKey = "";
        var lostAddress = req.body.lostAddress;
        var newPublicKey = req.body.newPublicKey;

        // Get form smart contract my encrypted part of the lost address

        // Each Public Key

        return res.status(200).json({result: "Recovered"});
    }
    return res.status(400).json({message: "Invalid parameters"});
};

/**
 * Parse private key to public and address
 */
exports.parsePrivateKey = function(req, res) {
    if (req.body.privateKey) {
        var identity = EasyCrypto.CreateIdentityByPrivateKey(req.body.privateKey);
        return res.status(200).json({address: identity.address, publicKey: identity.publicKey, privateKey: identity.privateKey});
    }
    return res.status(400).json({message: "Invalid parameters"});
};