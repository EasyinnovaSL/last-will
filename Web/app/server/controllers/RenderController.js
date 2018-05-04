
var FileSystem = require('fs');

/**
 * Render home
 */

exports.renderHome = function (req, res) {
    return res.render('index', {header: false});
};

exports.renderSaveAccount = function (req, res) {
  return res.render('lost/save-account');
};

exports.renderRecoverMyAccount = function (req, res) {
  return res.render('lost/recover-my-account');
};

exports.renderRecoverAccountPart = function (req, res) {
  return res.render('lost/recover-account-part');
};
exports.renderMyWills = function (req, res) {
    return res.render('hierarchy/my-ethereum-will.html');
};
exports.renderDemoKeys = function (req, res) {
  return res.render('lost/demo-keys');
};
exports.renderRequirements = function(req,res){
    return res.render('hierarchy/requirements');
};

