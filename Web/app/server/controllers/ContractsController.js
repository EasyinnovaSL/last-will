
var FileSystem = require('fs');

/**
 * Get Smart Contracts Info
 */

exports.getContractsInfo = function (req, res, next) {
    // Read contracts
    var baseContract = FileSystem.readFileSync("../contractBackToLife.json");
    if (!baseContract) return res.redirect("/error");
    var hierarchyContract = FileSystem.readFileSync("../contractHierarchy.json");
    if (!hierarchyContract) return res.redirect("/error");
    res.locals.contracts = {
        base: JSON.parse(baseContract),
        hierarchy: JSON.parse(hierarchyContract),
    };

    // Continue
    next();
};

exports.checkMetaMask = function(req,res,next) {
    res.locals.metamask = true;
    next();
};
