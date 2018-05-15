var RenderController = require('./controllers/RenderController');
var ContractsController = require('./controllers/ContractsController');

module.exports = function (app) {

    // Home
    app.get('/', ContractsController.getContractsInfo, RenderController.renderHome);

    // Error meta mask
    app.get('/requirements', RenderController.renderRequirements);

// Meta Mask must be installed
    app.use('*', ContractsController.getContractsInfo, ContractsController.checkMetaMask);

    // Render hierarchy contracts list
    app.get('/my-wills', RenderController.renderMyWills);

    //Render heir-detail
    app.get('/heir-detail', RenderController.heirDetail);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};