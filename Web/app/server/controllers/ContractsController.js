
var FileSystem = require('fs');

/**
 * Get Smart Contracts Info
 */

exports.getContractsInfo = function (req, res, next) {
    // var baseContract = FileSystem.readFileSync("../contractBackToLife.json");
    // if (!baseContract) return res.redirect("/error");
    var lostContract = FileSystem.readFileSync("../contractLostPassword.json");
    if (!lostContract) return res.redirect("/error");
    res.locals.contracts = {
        // base: JSON.parse(baseContract),
        lost: JSON.parse(lostContract)
    };

    // Continue
    next();
};

exports.checkMetaMask = function(req,res,next) {
    res.locals.metamask = true;
    next();
};
