
var RenderController = require('./controllers/RenderController');
var CryptoController = require('./controllers/CryptoController');

module.exports = function (app) {

    // Home
    app.get('/', RenderController.renderHome);

    //Save account
  app.get('/save-account', RenderController.renderSaveAccount);
    //Recover my account
  app.get('/recover-my-account', RenderController.renderRecoverMyAccount);
    //Recover account part
  app.get('/recover-account-part', RenderController.renderRecoverAccountPart);


    // Save password
    app.post('/save-password', CryptoController.savePassword);

    // Recover password
    app.post('/recover-password', CryptoController.recoverPassword);

    // Get public and address form private key
    app.post('/parse-private', CryptoController.parsePrivateKey);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};