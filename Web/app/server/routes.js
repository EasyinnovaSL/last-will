var RenderController = require('./controllers/RenderController');
var ContractsController = require('./controllers/ContractsController');
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

    // Error meta mask
    app.get('/requirements', RenderController.renderRequirements);

// Ether private key is required //
    app.use('/eth', CryptoController.isEtherKeySet);

    // Save password
    app.post('/eth/save-password', CryptoController.savePassword);

    // Recover password
    app.post('/eth/recover-password', CryptoController.recoverPassword);

    // Recover password part
    app.post('/eth/recover-part', CryptoController.recoverPasswordPart);

    // Get public and address form private key
    app.post('/eth/parse-private', CryptoController.parsePrivateKey);

// Meta Mask must be installed
    app.use('*', ContractsController.getContractsInfo, ContractsController.checkMetaMask);

    // Render hierarchy contracts list
    app.get('/my-wills', RenderController.renderMyWills);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};