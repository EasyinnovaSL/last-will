
var Config = require('../config/config');

/**
 * Render pages
 */

exports.renderHome = function (req, res) {
    return res.render('index', {header: false});
};
exports.renderMyWills = function (req, res) {
    return res.render('hierarchy/my-ethereum-will.html');
};
exports.renderRequirements = function(req,res){
    return res.render('hierarchy/requirements');
};
exports.renderWitness = function(req,res){
    return res.render('hierarchy/witness',{pk:req.query.pk, will:req.query.will});
};
exports.renderHeir = function(req,res){
    return res.render('hierarchy/heir-detail',{pk: req.query.pk, will: req.query.will});
};

/**
 * Load Configuration
 */
exports.renderConfiguration = function (req, res, next) {
    // Remove main private key from config
    Config.mainPrivateKey = null;
    res.locals.Config = Config;
    next();
};