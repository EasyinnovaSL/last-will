var Contracts = require('./ContractsController');

/**
 * Render pages
 */

exports.renderHome = function (req, res) {
    return res.render('index');
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
exports.renderAboutUs = function (req, res) {
    return res.render('hierarchy/about-us');
};
exports.renderContactUs = function (req, res) {
    return res.render('hierarchy/contact-us');
};

/**
 * Load Configuration
 */
exports.renderConfiguration = function (req, res, next) {
    res.locals.Config = {
        provider: Contracts.getProvider(req.session.real)
    };
    next();
};
