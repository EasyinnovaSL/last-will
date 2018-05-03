
/**
 * Render home
 */

exports.renderHome = function (req, res) {
    return res.render('index');
};

exports.renderSaveAccount = function (req, res) {
  return res.render('save-account.html');
};

exports.renderRecoverMyAccount = function (req, res) {
  return res.render('recover-my-account.html');
};

exports.renderRecoverAccountPart = function (req, res) {
    return res.render('recover-account-part.html');
};
exports.renderMyWills = function (req, res) {
    return res.render('my-ethereum-will.html');
};
exports.renderDemoKeys = function (req, res) {
  return res.render('demo-keys.html');
};


