
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

  // Ether private key is required //
    app.use('*', CryptoController.isEtherKeySet);

    // Save password
    app.post('/save-password', CryptoController.savePassword);

    // Recover password
    app.post('/recover-password', CryptoController.recoverPassword);

    // Recover password part
    app.post('/recover-part', CryptoController.recoverPasswordPart);

    // Get public and address form private key
    app.post('/parse-private', CryptoController.parsePrivateKey);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};