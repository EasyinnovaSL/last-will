
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


